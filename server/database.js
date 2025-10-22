const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'disaster_reports.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Logger utility
const logger = {
    info: (message, data) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error.message : '');
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
    },
    debug: (message, data) => {
        console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
    }
};


// Initialize database function
function initializeDatabase() {
    try {
        // Reports table
        db.exec(`
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                province_code TEXT NOT NULL UNIQUE,
                province_name TEXT NOT NULL,
                situation_overview TEXT,
                intensity TEXT,
                coordination_notes TEXT,
                affected_families INTEGER DEFAULT 0,
                affected_persons INTEGER DEFAULT 0,
                damaged_totally INTEGER DEFAULT 0,
                damaged_partially INTEGER DEFAULT 0,
                no_casualties BOOLEAN DEFAULT 0,
                injured INTEGER DEFAULT 0,
                wounded INTEGER DEFAULT 0,
                dead INTEGER DEFAULT 0,
                tsunami_alert BOOLEAN DEFAULT 0,
                tsunami_remarks TEXT,
                suspension_alert BOOLEAN DEFAULT 0,
                suspension_remarks TEXT,
                gale_warning BOOLEAN DEFAULT 0,
                gale_remarks TEXT,
                power_interruption BOOLEAN DEFAULT 0,
                power_remarks TEXT,
                water_interruption BOOLEAN DEFAULT 0,
                water_remarks TEXT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                updated_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
        `);

        // Initialize with 5 provinces (CARAGA region)
        const provinces = [
            { code: '1600', name: 'Agusan del Norte' },
            { code: '1601', name: 'Agusan del Sur' },
            { code: '1602', name: 'Surigao del Norte' },
            { code: '1603', name: 'Surigao del Sur' },
            { code: '1685', name: 'Dinagat Islands' }
        ];

        const checkStmt = db.prepare('SELECT COUNT(*) as count FROM reports');
        const count = checkStmt.get().count;

        // Only insert if table is empty
        if (count === 0) {
            const insertStmt = db.prepare(`
                INSERT INTO reports (province_code, province_name, situation_overview, intensity, coordination_notes, affected_families, affected_persons, damaged_totally, damaged_partially, no_casualties, injured, wounded, dead, tsunami_alert, suspension_alert, gale_warning, power_interruption, water_interruption)
                VALUES (?, ?, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            `);

            provinces.forEach(province => {
                insertStmt.run(province.code, province.name);
                logger.debug('Initialized province', { code: province.code, name: province.name });
            });

            logger.info('Database initialized successfully', { provincesCount: 5 });
        } else {
            logger.info('Database already initialized', { existingRecords: count });
        }
    } catch (error) {
        logger.error('Failed to initialize database', error);
        throw error;
    }
}

// Initialize on module load
initializeDatabase();

// CRUD Operations

// Validate province exists before update
function validateProvinceExists(provinceCode) {
    try {
        const stmt = db.prepare('SELECT province_code FROM reports WHERE province_code = ?');
        const result = stmt.get(provinceCode);
        return result !== undefined;
    } catch (error) {
        logger.error('Error validating province', error);
        throw new Error('Failed to validate province');
    }
}

// Update report by province code (with transaction support)
function updateReport(reportData) {
    const {
        province,
        situationOverview,
        intensity,
        coordinationNotes,
        affectedFamilies,
        affectedPersons,
        damagedTotally,
        damagedPartially,
        noCasualties,
        injured,
        wounded,
        dead,
        tsunamiAlert,
        tsunamiRemarks,
        suspensionAlert,
        suspensionRemarks,
        galeWarning,
        galeRemarks,
        powerInterruption,
        powerRemarks,
        waterInterruption,
        waterRemarks
    } = reportData;

    try {
        // Validate province exists first
        if (!validateProvinceExists(province.code)) {
            logger.warn('Update attempted for non-existent province', {
                provinceCode: province.code,
                provinceName: province.name
            });
            return {
                success: false,
                changes: 0,
                lastInsertRowid: null,
                error: 'Province not found'
            };
        }

        // Start transaction
        const updateStmt = db.prepare(`
            UPDATE reports
            SET situation_overview = ?,
                intensity = ?,
                coordination_notes = ?,
                affected_families = ?,
                affected_persons = ?,
                damaged_totally = ?,
                damaged_partially = ?,
                no_casualties = ?,
                injured = ?,
                wounded = ?,
                dead = ?,
                tsunami_alert = ?,
                tsunami_remarks = ?,
                suspension_alert = ?,
                suspension_remarks = ?,
                gale_warning = ?,
                gale_remarks = ?,
                power_interruption = ?,
                power_remarks = ?,
                water_interruption = ?,
                water_remarks = ?,
                updated_at = datetime('now', 'localtime')
            WHERE province_code = ?
        `);

        const result = updateStmt.run(
            situationOverview || null,
            intensity || null,
            coordinationNotes || null,
            affectedFamilies || 0,
            affectedPersons || 0,
            damagedTotally || 0,
            damagedPartially || 0,
            noCasualties ? 1 : 0,
            injured || 0,
            wounded || 0,
            dead || 0,
            tsunamiAlert ? 1 : 0,
            tsunamiRemarks || null,
            suspensionAlert ? 1 : 0,
            suspensionRemarks || null,
            galeWarning ? 1 : 0,
            galeRemarks || null,
            powerInterruption ? 1 : 0,
            powerRemarks || null,
            waterInterruption ? 1 : 0,
            waterRemarks || null,
            province.code
        );

        // Log successful update
        logger.info('Report updated successfully', {
            provinceCode: province.code,
            provinceName: province.name,
            changes: result.changes
        });

        return {
            success: true,
            changes: result.changes,
            lastInsertRowid: null,
            error: null
        };

    } catch (error) {
        logger.error('Failed to update report', error);
        return {
            success: false,
            changes: 0,
            lastInsertRowid: null,
            error: error.message
        };
    }
}

// Get report by province code
function getReportByProvince(provinceCode) {
    try {
        const stmt = db.prepare(`
            SELECT * FROM reports WHERE province_code = ?
        `);

        const report = stmt.get(provinceCode);

        if (!report) {
            logger.debug('Report not found', { provinceCode });
            return null;
        }

        logger.debug('Report retrieved successfully', {
            provinceCode,
            provinceName: report.province_name,
            hasData: !!report.situation_overview
        });

        return {
            id: report.id,
            province: {
                code: report.province_code,
                name: report.province_name
            },
            situationOverview: report.situation_overview,
            intensity: report.intensity,
            coordinationNotes: report.coordination_notes,
            affectedFamilies: report.affected_families,
            affectedPersons: report.affected_persons,
            damagedTotally: report.damaged_totally,
            damagedPartially: report.damaged_partially,
            noCasualties: !!report.no_casualties,
            injured: report.injured,
            wounded: report.wounded,
            dead: report.dead,
            tsunamiAlert: !!report.tsunami_alert,
            tsunamiRemarks: report.tsunami_remarks,
            suspensionAlert: !!report.suspension_alert,
            suspensionRemarks: report.suspension_remarks,
            galeWarning: !!report.gale_warning,
            galeRemarks: report.gale_remarks,
            powerInterruption: !!report.power_interruption,
            powerRemarks: report.power_remarks,
            waterInterruption: !!report.water_interruption,
            waterRemarks: report.water_remarks,
            createdAt: report.created_at,
            updatedAt: report.updated_at
        };
    } catch (error) {
        logger.error('Error retrieving report by province', error);
        throw error;
    }
}

// Create a new report (deprecated - kept for compatibility)
function createReport(reportData) {
    return updateReport(reportData);
}

// Get all reports
function getAllReports() {
    try {
        const reports = db.prepare(`
            SELECT * FROM reports ORDER BY created_at DESC
        `).all();

        logger.debug('All reports retrieved', { count: reports.length });

        return reports.map(report => ({
            id: report.id,
            province: {
                code: report.province_code,
                name: report.province_name
            },
            situationOverview: report.situation_overview,
            intensity: report.intensity,
            coordinationNotes: report.coordination_notes,
            affectedFamilies: report.affected_families,
            affectedPersons: report.affected_persons,
            damagedTotally: report.damaged_totally,
            damagedPartially: report.damaged_partially,
            noCasualties: !!report.no_casualties,
            injured: report.injured,
            wounded: report.wounded,
            dead: report.dead,
            tsunamiAlert: !!report.tsunami_alert,
            tsunamiRemarks: report.tsunami_remarks,
            suspensionAlert: !!report.suspension_alert,
            suspensionRemarks: report.suspension_remarks,
            galeWarning: !!report.gale_warning,
            galeRemarks: report.gale_remarks,
            powerInterruption: !!report.power_interruption,
            powerRemarks: report.power_remarks,
            waterInterruption: !!report.water_interruption,
            waterRemarks: report.water_remarks,
            createdAt: report.created_at,
            updatedAt: report.updated_at
        }));
    } catch (error) {
        logger.error('Error retrieving all reports', error);
        throw error;
    }
}

// Get reports by province
function getReportsByProvince(provinceCode) {
    const reports = db.prepare(`
        SELECT * FROM reports WHERE province_code = ? ORDER BY created_at DESC
    `).all(provinceCode);

    return reports.map(report => ({
        id: report.id,
        province: {
            code: report.province_code,
            name: report.province_name
        },
        situationOverview: report.situation_overview,
        intensity: report.intensity,
        coordinationNotes: report.coordination_notes,
        affectedFamilies: report.affected_families,
        affectedPersons: report.affected_persons,
        damagedTotally: report.damaged_totally,
        damagedPartially: report.damaged_partially,
        noCasualties: !!report.no_casualties,
        injured: report.injured,
        wounded: report.wounded,
        dead: report.dead,
        tsunamiAlert: !!report.tsunami_alert,
        tsunamiRemarks: report.tsunami_remarks,
        suspensionAlert: !!report.suspension_alert,
        suspensionRemarks: report.suspension_remarks,
        galeWarning: !!report.gale_warning,
        galeRemarks: report.gale_remarks,
        powerInterruption: !!report.power_interruption,
        powerRemarks: report.power_remarks,
        waterInterruption: !!report.water_interruption,
        waterRemarks: report.water_remarks,
        createdAt: report.created_at,
        updatedAt: report.updated_at
    }));
}

// Delete a report
function deleteReport(reportId) {
    try {
        const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
        const result = stmt.run(reportId);

        if (result.changes > 0) {
            logger.info('Report deleted successfully', { reportId });
        } else {
            logger.warn('Attempted to delete non-existent report', { reportId });
        }

        return result;
    } catch (error) {
        logger.error('Error deleting report', error);
        throw error;
    }
}

// Delete all reports
function deleteAllReports() {
    try {
        const stmt = db.prepare('DELETE FROM reports');
        const result = stmt.run();

        logger.warn('All reports deleted', { deletedCount: result.changes });

        return result;
    } catch (error) {
        logger.error('Error deleting all reports', error);
        throw error;
    }
}

// Reset all reports (sets values to 0/null, keeps templates)
function resetAllReports() {
    try {
        const stmt = db.prepare(`
            UPDATE reports
            SET situation_overview = NULL,
                intensity = NULL,
                coordination_notes = NULL,
                affected_families = 0,
                affected_persons = 0,
                damaged_totally = 0,
                damaged_partially = 0,
                no_casualties = 0,
                injured = 0,
                wounded = 0,
                dead = 0,
                tsunami_alert = 0,
                tsunami_remarks = NULL,
                suspension_alert = 0,
                suspension_remarks = NULL,
                gale_warning = 0,
                gale_remarks = NULL,
                power_interruption = 0,
                power_remarks = NULL,
                water_interruption = 0,
                water_remarks = NULL,
                updated_at = datetime('now', 'localtime')
        `);

        const result = stmt.run();

        logger.warn('All reports reset to default values', { resetCount: result.changes });

        return result;
    } catch (error) {
        logger.error('Error resetting all reports', error);
        throw error;
    }
}

// Export functions
module.exports = {
    db,
    createReport,
    updateReport,
    getReportByProvince,
    getAllReports,
    getReportsByProvince,
    deleteReport,
    deleteAllReports,
    resetAllReports
};
