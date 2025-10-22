const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'disaster_reports.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
    // Reports table
    db.exec(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            province_code TEXT NOT NULL,
            province_name TEXT NOT NULL,
            situation_overview TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    `);

    console.log('Database initialized successfully');
}

// Initialize on module load
initializeDatabase();

// CRUD Operations

// Create a new report
function createReport(reportData) {
    const { province, situationOverview } = reportData;

    const insertReport = db.prepare(`
        INSERT INTO reports (province_code, province_name, situation_overview)
        VALUES (?, ?, ?)
    `);

    return insertReport.run(
        province.code,
        province.name,
        situationOverview
    );
}

// Get all reports
function getAllReports() {
    const reports = db.prepare(`
        SELECT * FROM reports ORDER BY created_at DESC
    `).all();

    return reports.map(report => ({
        id: report.id,
        province: {
            code: report.province_code,
            name: report.province_name
        },
        situationOverview: report.situation_overview,
        createdAt: report.created_at
    }));
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
        createdAt: report.created_at
    }));
}

// Delete a report
function deleteReport(reportId) {
    const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
    return stmt.run(reportId);
}

// Delete all reports
function deleteAllReports() {
    const stmt = db.prepare('DELETE FROM reports');
    return stmt.run();
}

// Export functions
module.exports = {
    db,
    createReport,
    getAllReports,
    getReportsByProvince,
    deleteReport,
    deleteAllReports
};
