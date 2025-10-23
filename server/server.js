const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
    createReport,
    updateReport,
    getReportByProvince,
    getAllReports,
    getReportsByProvince,
    deleteReport,
    deleteAllReports,
    resetAllReports,
    archiveAllReports
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Logger utility for server logging
const serverLogger = {
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

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    serverLogger.debug('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    next();
});

// Serve static files (frontend)
app.use(express.static('../'));

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Get all reports
app.get('/api/reports', (req, res) => {
    try {
        const reports = getAllReports();
        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
});

// Get report by province code
app.get('/api/reports/province/:provinceCode', (req, res) => {
    try {
        const { provinceCode } = req.params;

        serverLogger.debug('Fetching report for province', { provinceCode });

        const report = getReportByProvince(provinceCode);

        if (!report) {
            serverLogger.warn('Report not found for province', { provinceCode });
            return res.status(404).json({
                success: false,
                message: 'Report not found for this province'
            });
        }

        serverLogger.debug('Report fetched successfully', {
            provinceCode,
            hasData: !!report.situationOverview
        });

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        serverLogger.error('Error fetching report by province', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Update a report (by province code) with comprehensive validation
app.post('/api/reports', (req, res) => {
    try {
        const reportData = req.body;

        serverLogger.debug('Update report request received', {
            hasProvince: !!reportData.province,
            fieldsCount: Object.keys(reportData).length
        });

        // Validate required fields
        if (!reportData.province) {
            serverLogger.warn('Missing province field in update request', {
                receivedFields: Object.keys(reportData)
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required field: province'
            });
        }

        if (!reportData.province.code) {
            serverLogger.warn('Missing province code in update request');
            return res.status(400).json({
                success: false,
                message: 'Missing required field: province.code'
            });
        }

        // Call database update function
        const result = updateReport(reportData);

        // Check if update was successful
        if (!result.success || result.changes === 0) {
            serverLogger.warn('Update failed or province not found', {
                provinceCode: reportData.province.code,
                success: result.success,
                changes: result.changes,
                error: result.error
            });
            return res.status(404).json({
                success: false,
                message: result.error || 'Province not found in system'
            });
        }

        serverLogger.info('Report updated successfully', {
            provinceCode: reportData.province.code,
            provinceName: reportData.province.name
        });

        res.json({
            success: true,
            message: 'Report updated successfully',
            data: {
                provinceCode: reportData.province.code,
                provinceName: reportData.province.name,
                updatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        serverLogger.error('Error updating report', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Update a report via PUT endpoint
app.put('/api/reports/:provinceCode', (req, res) => {
    try {
        const { provinceCode } = req.params;
        const reportData = req.body;

        const existingReport = getReportByProvince(provinceCode);

        if (!existingReport) {
            return res.status(404).json({
                success: false,
                message: 'Province not found in system'
            });
        }

        const result = updateReport({
            province: {
                code: provinceCode,
                name: existingReport.province.name
            },
            ...reportData
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to update report'
            });
        }

        res.json({
            success: true,
            message: 'Report updated successfully'
        });
    } catch (error) {
        serverLogger.error('Error updating report via PUT', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Delete a specific report
app.delete('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;

        serverLogger.debug('Deleting report', { id });

        const result = deleteReport(id);

        if (result.changes === 0) {
            serverLogger.warn('Report not found for deletion', { id });
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        serverLogger.info('Report deleted successfully', { id });

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        serverLogger.error('Error deleting report', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete report',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Delete all reports
app.delete('/api/reports', (req, res) => {
    try {
        serverLogger.warn('Deleting all reports - this operation cannot be undone');

        const result = deleteAllReports();

        serverLogger.info('All reports deleted successfully', {
            deletedCount: result.changes
        });

        res.json({
            success: true,
            message: `All reports deleted successfully (${result.changes} reports removed)`,
            deletedCount: result.changes
        });
    } catch (error) {
        serverLogger.error('Error deleting all reports', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reports',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Reset all reports (sets values to 0/null, keeps templates)
app.post('/api/reports/reset', (req, res) => {
    try {
        serverLogger.warn('Resetting all reports to default values');

        const result = resetAllReports();

        serverLogger.info('All reports reset successfully', {
            resetCount: result.changes
        });

        res.json({
            success: true,
            message: `All reports reset successfully (${result.changes} reports reset to default values)`,
            resetCount: result.changes
        });
    } catch (error) {
        serverLogger.error('Error resetting all reports', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset reports',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Archive all active reports
app.post('/api/reports/archive', (req, res) => {
    try {
        serverLogger.warn('Archiving all active reports');

        const result = archiveAllReports();

        serverLogger.info('All reports archived successfully', {
            archivedCount: result.changes
        });

        res.json({
            success: true,
            message: `All reports archived successfully (${result.changes} reports archived)`,
            archivedCount: result.changes
        });
    } catch (error) {
        serverLogger.error('Error archiving all reports', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive reports',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// 404 handler
app.use((req, res) => {
    serverLogger.warn('Route not found', {
        method: req.method,
        path: req.path
    });
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    serverLogger.error('Unhandled server error', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server - Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';

    // Find local IP address
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
    }

    const startupMessage = `
╔═══════════════════════════════════════════════════════╗
║   CARAGA Disaster Reporting System API Server        ║
╠═══════════════════════════════════════════════════════╣
║   Local:   http://localhost:${PORT}                  ║
║   Network: http://${localIP}:${PORT}                 ║
║                                                       ║
║   API Endpoints:                                      ║
║   - GET    /api/health                                ║
║   - GET    /api/reports                               ║
║   - GET    /api/reports/province/:code                ║
║   - POST   /api/reports       (Update by province)   ║
║   - PUT    /api/reports/:code (Update by province)   ║
║   - POST   /api/reports/reset (Reset all to default) ║
║   - POST   /api/reports/archive (Archive all active) ║
║   - DELETE /api/reports/:id                           ║
║   - DELETE /api/reports                               ║
║                                                       ║
║   Database: 5 provinces initialized with archiving   ║
║   Logging: Enabled (timestamps & request tracking)  ║
║   Validation: Comprehensive province & data checks   ║
╚═══════════════════════════════════════════════════════╝
    `;

    console.log(startupMessage);
    serverLogger.info('Server started successfully', {
        port: PORT,
        localIP,
        environment: process.env.NODE_ENV || 'production'
    });
});

module.exports = app;
