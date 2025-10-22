const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
    createReport,
    getAllReports,
    getReportsByProvince,
    deleteReport,
    deleteAllReports
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Get reports by province
app.get('/api/reports/province/:provinceCode', (req, res) => {
    try {
        const { provinceCode } = req.params;
        const reports = getReportsByProvince(provinceCode);
        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('Error fetching reports by province:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
});

// Create a new report
app.post('/api/reports', (req, res) => {
    try {
        const reportData = req.body;

        // Validate required fields
        if (!reportData.province || !reportData.situationOverview) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: province, situationOverview'
            });
        }

        const result = createReport(reportData);

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            reportId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create report',
            error: error.message
        });
    }
});

// Delete a specific report
app.delete('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;
        const result = deleteReport(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete report',
            error: error.message
        });
    }
});

// Delete all reports
app.delete('/api/reports', (req, res) => {
    try {
        const result = deleteAllReports();
        res.json({
            success: true,
            message: `All reports deleted successfully (${result.changes} reports removed)`
        });
    } catch (error) {
        console.error('Error deleting all reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reports',
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
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

    console.log(`
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
║   - POST   /api/reports                               ║
║   - DELETE /api/reports/:id                           ║
║   - DELETE /api/reports                               ║
╚═══════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
