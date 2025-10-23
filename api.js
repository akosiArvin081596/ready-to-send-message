// API Configuration
// Automatically detect if accessing from network or localhost
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `http://${window.location.hostname}:3000/api`;

// API Helper Functions

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Report API Functions

async function createReport(reportData) {
    return apiRequest('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
    });
}

async function updateReport(reportData) {
    return apiRequest('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
    });
}

async function updateReportByCode(provinceCode, situationOverview) {
    return apiRequest(`/reports/${provinceCode}`, {
        method: 'PUT',
        body: JSON.stringify({ situationOverview })
    });
}

async function getReport(provinceCode) {
    return apiRequest(`/reports/province/${provinceCode}`);
}

async function getAllReports() {
    return apiRequest('/reports');
}

async function getReportsByProvince(provinceCode) {
    return apiRequest(`/reports/province/${provinceCode}`);
}

async function deleteReport(reportId) {
    return apiRequest(`/reports/${reportId}`, {
        method: 'DELETE'
    });
}

async function deleteAllReports() {
    return apiRequest('/reports', {
        method: 'DELETE'
    });
}

async function resetAllReports() {
    return apiRequest('/reports/reset', {
        method: 'POST'
    });
}

async function archiveAllReports() {
    return apiRequest('/reports/archive', {
        method: 'POST'
    });
}

async function checkServerHealth() {
    return apiRequest('/health');
}

// Export functions
window.API = {
    createReport,
    updateReport,
    updateReportByCode,
    getReport,
    getAllReports,
    getReportsByProvince,
    deleteReport,
    deleteAllReports,
    resetAllReports,
    archiveAllReports,
    checkServerHealth
};
