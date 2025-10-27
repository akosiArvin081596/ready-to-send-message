# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CARAGA Disaster Reporting System - A mobile-first disaster reporting application for Region XIII (CARAGA) in the Philippines. The system allows province-level users to submit earthquake/disaster reports, which are consolidated for regional oversight.

## Development Commands

### Start the Backend Server

```bash
cd server
npm install          # First time setup
npm start           # Production mode
npm run dev         # Development mode with auto-reload (nodemon)
```

Server runs on `http://localhost:3000` (or network IP shown in startup banner)

### Access the Application

- **Province Login/Form**: `http://localhost:3000/index.html`
- **Consolidated Reports**: `http://localhost:3000/consolidated.html`
- **Health Check API**: `http://localhost:3000/api/health`

### Database Operations

The SQLite database (`server/disaster_reports.db`) is automatically created and initialized with 5 CARAGA provinces on first run.

To reset the database:
```bash
cd server
rm disaster_reports.db    # Delete database file
npm start                 # Will recreate with fresh data
```

## Architecture Overview

### Frontend-Backend Communication

The application uses a **province-based update system** rather than traditional create/update operations:

1. **Database Pre-initialization**: 5 provinces (Agusan del Norte, Agusan del Sur, Surigao del Norte, Surigao del Sur, Dinagat Islands) are pre-created in the database on startup
2. **Update-Only Pattern**: All POST requests to `/api/reports` update existing province records by `province_code` - there are no true "create" operations
3. **Province Code as Key**: Province code (PSGC codes like '1600', '1601', etc.) serves as the primary identifier for updates

This design ensures each province always has exactly one active report entry in the database.

### Data Flow

```
Login (index.html) → Form (form.html) → Backend Update → Database
                                     ↓
                          Consolidated View (consolidated.html)
```

1. User logs in by selecting their province (session storage)
2. Form loads existing report data via `GET /api/reports/province/:code`
3. Form submits updates via `POST /api/reports` (updates by province code)
4. Consolidated view fetches all active reports via `GET /api/reports`

### Key Files and Responsibilities

**Backend (server/)**
- `server.js` - Express server with comprehensive request logging and validation
- `database.js` - SQLite operations with transaction support, logging, and archiving
- `disaster_reports.db` - SQLite database (auto-created)

**Frontend (root)**
- `index.html` + `login.js` - Province selection and authentication
- `form.html` + `form.js` - Data entry form with real-time validation
- `consolidated.html` + `consolidated.js` - Read-only consolidated view with copy-to-clipboard
- `api.js` - API client layer with automatic localhost/network detection
- `psgc-data.js` - Philippine Standard Geographic Codes for CARAGA provinces and LGUs

**Shared Resources**
- `styles.css` - Global mobile-first CSS with CSS variables for theming

### Database Schema

The `reports` table uses a **flat structure** (not relational) with all data in one table:

**Key columns:**
- `province_code` (TEXT) - PSGC code, used for updates
- `province_name` (TEXT) - Province name
- `situation_overview`, `intensity`, `coordination_notes` (TEXT) - Narrative fields
- `affected_families`, `affected_persons` (INTEGER) - Population impact
- `damaged_totally`, `damaged_partially` (INTEGER) - Infrastructure damage
- `no_casualties` (BOOLEAN), `injured`, `wounded`, `dead` (INTEGER) - Casualties
- Alert flags: `tsunami_alert`, `suspension_alert`, `gale_warning`, `power_interruption`, `water_interruption` (BOOLEAN)
- Remarks: `*_remarks` (TEXT) - Details for each alert type
- `status` (TEXT) - 'active' or 'archived'
- `created_at`, `updated_at` (TEXT) - Timestamps

**Important**: There is NO `lgu_data` table. The schema described in README.md is outdated. All data is stored in the flat `reports` table.

### API Validation Pattern

The server employs comprehensive validation in `server.js`:

1. **Province Validation**: Checks if `province.code` exists before allowing updates
2. **Field Validation**: Ensures required fields are present
3. **Error Responses**: Returns structured JSON with `success`, `message`, and optional `error` fields
4. **Logging**: All operations are logged with timestamps via the `serverLogger` utility

## Special Features

### Archive System

The application supports archiving old reports:

- `POST /api/reports/archive` - Marks all active reports as 'archived'
- `POST /api/reports/reset` - Resets active reports to default values (zeros/nulls) without deleting
- Archive system preserves historical data while clearing active reports for new updates

### Auto-Loading Form Data

When a province user opens the form, it automatically loads their existing report data via:
```javascript
loadExistingReport() → API.getReport(provinceCode) → populateFormData(data)
```

This provides a "save and continue later" experience.

### Network Access

The server binds to `0.0.0.0` (all interfaces) and displays both localhost and network IPs on startup. The frontend automatically detects the hostname and uses the appropriate API URL (see `api.js:3-5`).

## Common Gotchas

1. **Creating new provinces**: The system only supports the 5 pre-initialized provinces. Adding new provinces requires modifying `database.js:86-92`

2. **Database migrations**: The `database.js` includes migration logic for the `status` column (lines 64-83). If you modify the schema, follow this pattern

3. **LGU data**: The `psgc-data.js` file contains all LGU codes but they are currently NOT stored in the database - only used for frontend display/reference

4. **Casualties logic**: When `noCasualties` checkbox is checked, the form automatically sets `injured`, `wounded`, `dead` to 0

5. **Alert remarks**: Remarks fields are only shown/submitted when their corresponding alert checkbox is enabled

## Testing the Application

1. Start the server: `cd server && npm start`
2. Open `http://localhost:3000` in browser
3. Select a province (e.g., "Agusan del Norte")
4. Fill in the form with test data
5. Submit the report
6. Navigate to `http://localhost:3000/consolidated.html` to view all reports
7. Use "Copy Ready to Send Message" button to get formatted text

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to 'development' for detailed error messages

## Troubleshooting

**Port already in use**: Change PORT in server startup or kill the process using port 3000

**Database locked errors**: Ensure only one server instance is running (SQLite doesn't support multiple writers)

**CORS errors**: The server has CORS enabled for all origins (`cors()` middleware). If issues persist, check browser console for specific errors

**Form data not loading**: Check server logs for validation errors. Common issue: province code mismatch between frontend and database
