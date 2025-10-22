# CARAGA Disaster Reporting System

A mobile-first disaster reporting system for the CARAGA region (Region XIII) in the Philippines, with SQLite database backend.

## Features

-   Province-based login system
-   Dynamic LGU data entry forms
-   Real-time data persistence with SQLite
-   Consolidated reporting view with copyable text format
-   Mobile-first responsive design
-   RESTful API backend

## Tech Stack

### Frontend

-   HTML5
-   CSS3
-   Vanilla JavaScript
-   Mobile-first responsive design

### Backend

-   Node.js
-   Express.js
-   SQLite3 (better-sqlite3)
-   CORS enabled

## Installation

### Prerequisites

-   Node.js (v14 or higher)
-   npm (comes with Node.js)

### Setup Instructions

1. **Navigate to the server directory:**

    ```bash
    cd server
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Start the server:**

    ```bash
    npm start
    ```

    For development with auto-restart:

    ```bash
    npm run dev
    ```

4. **Access the application:**
   Open your browser and go to:
    ```
    http://localhost:3000
    ```

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| GET    | `/health`                 | Check server health          |
| GET    | `/reports`                | Get all reports              |
| GET    | `/reports/province/:code` | Get reports by province code |
| POST   | `/reports`                | Create a new report          |
| DELETE | `/reports/:id`            | Delete a specific report     |
| DELETE | `/reports`                | Delete all reports           |

### Example API Request

**Create a Report:**

```javascript
POST /api/reports
Content-Type: application/json

{
  "province": {
    "code": "1600",
    "name": "Agusan del Norte"
  },
  "situationOverview": "Description of the situation...",
  "reportDate": "2025-10-20T17:00:00.000Z",
  "lguData": [
    {
      "lguCode": "160001",
      "lguName": "Butuan City (Capital)",
      "affectedFamilies": 10,
      "affectedIndividuals": 50,
      "damagedHousesPartial": 5,
      "damagedHousesTotal": 2,
      "casualtiesInjured": 1,
      "casualtiesWounded": 0,
      "casualtiesDead": 0
    }
  ]
}
```

## Database Schema

### Reports Table

```sql
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    province_code TEXT NOT NULL,
    province_name TEXT NOT NULL,
    situation_overview TEXT NOT NULL,
    report_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
)
```

### LGU Data Table

```sql
CREATE TABLE lgu_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    lgu_code TEXT NOT NULL,
    lgu_name TEXT NOT NULL,
    affected_families INTEGER DEFAULT 0,
    affected_individuals INTEGER DEFAULT 0,
    damaged_houses_partial INTEGER DEFAULT 0,
    damaged_houses_total INTEGER DEFAULT 0,
    casualties_injured INTEGER DEFAULT 0,
    casualties_wounded INTEGER DEFAULT 0,
    casualties_dead INTEGER DEFAULT 0,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
)
```

## Project Structure

```
Mobile/
├── index.html              # Login page
├── form.html               # Data entry form
├── consolidated.html       # Consolidated reports view
├── styles.css              # Global styles
├── login.js                # Login functionality
├── form.js                 # Form management
├── consolidated.js         # Reports display
├── psgc-data.js           # PSGC province/LGU data
├── api.js                 # API communication layer
├── README.md              # This file
└── server/
    ├── package.json       # Node.js dependencies
    ├── server.js          # Express server
    ├── database.js        # SQLite database layer
    └── disaster_reports.db # SQLite database (created automatically)
```

## CARAGA Region Coverage

The system covers all 5 provinces in CARAGA Region:

1. **Agusan del Norte** - 12 LGUs
2. **Agusan del Sur** - 14 LGUs
3. **Surigao del Norte** - 21 LGUs
4. **Surigao del Sur** - 19 LGUs
5. **Dinagat Islands** - 7 LGUs

**Total: 73 LGUs** (6 cities, 67 municipalities)

## Usage

### For Province Users:

1. Go to `http://localhost:3000`
2. Select your province from the dropdown
3. Click "Login"
4. Fill in the Province Situation Overview
5. Add LGU data entries (click "+ Add LGU Data" for multiple entries)
6. Click "Submit Report"

### For Administrators:

1. Go to `http://localhost:3000/consolidated.html`
2. View all consolidated data from all provinces
3. Copy the formatted text using the "Copy Ready to Send Message" button
4. Paste into reports, emails, or documents

## Deployment

### For Production:

1. **Change API Base URL** in `api.js`:

    ```javascript
    const API_BASE_URL = "https://your-domain.com/api";
    ```

2. **Deploy Backend:**

    - Use services like Railway, Render, or Heroku
    - Or deploy on a VPS with PM2

3. **Deploy Frontend:**
    - Can be served from the same server
    - Or use static hosting (Vercel, Netlify)

### Environment Variables:

```bash
PORT=3000  # Server port
NODE_ENV=production
```

## Troubleshooting

### Server won't start:

-   Check if port 3000 is already in use
-   Make sure Node.js is installed: `node --version`
-   Delete `node_modules` and run `npm install` again

### Can't submit reports:

-   Ensure the server is running
-   Check browser console for errors
-   Verify API_BASE_URL in `api.js` matches your server address

### Database errors:

-   The database file is created automatically
-   Check write permissions in the server directory
-   Delete `disaster_reports.db` to start fresh

## Support

For issues or questions, please check:

-   Server console for error messages
-   Browser console (F12) for frontend errors
-   Ensure all dependencies are installed

## License

MIT License
