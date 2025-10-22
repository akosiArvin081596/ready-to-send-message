// PSGC (Philippine Standard Geographic Code) Data
// This contains provinces and their corresponding LGUs (cities/municipalities)

const PSGC_DATA = {
    provinces: [
        { code: '1600', name: 'Agusan del Norte' },
        { code: '1601', name: 'Agusan del Sur' },
        { code: '1602', name: 'Surigao del Norte' },
        { code: '1603', name: 'Surigao del Sur' },
        { code: '1685', name: 'Dinagat Islands' }
    ],

    lgus: {
        '1600': [ // Agusan del Norte
            { code: '160001', name: 'Butuan City (Capital)' },
            { code: '160002', name: 'Cabadbaran City' },
            { code: '160003', name: 'Buenavista' },
            { code: '160004', name: 'Carmen' },
            { code: '160005', name: 'Jabonga' },
            { code: '160006', name: 'Kitcharao' },
            { code: '160007', name: 'Las Nieves' },
            { code: '160008', name: 'Magallanes' },
            { code: '160009', name: 'Nasipit' },
            { code: '160010', name: 'Remedios T. Romualdez' },
            { code: '160011', name: 'Santiago' },
            { code: '160012', name: 'Tubay' }
        ],
        '1601': [ // Agusan del Sur
            { code: '160101', name: 'Prosperidad (Capital)' },
            { code: '160102', name: 'Bayugan City' },
            { code: '160103', name: 'Bunawan' },
            { code: '160104', name: 'Esperanza' },
            { code: '160105', name: 'La Paz' },
            { code: '160106', name: 'Loreto' },
            { code: '160107', name: 'Rosario' },
            { code: '160108', name: 'San Francisco' },
            { code: '160109', name: 'San Luis' },
            { code: '160110', name: 'Santa Josefa' },
            { code: '160111', name: 'Sibagat' },
            { code: '160112', name: 'Talacogon' },
            { code: '160113', name: 'Trento' },
            { code: '160114', name: 'Veruela' }
        ],
        '1602': [ // Surigao del Norte
            { code: '160201', name: 'Surigao City (Capital)' },
            { code: '160202', name: 'Alegria' },
            { code: '160203', name: 'Bacuag' },
            { code: '160204', name: 'Burgos' },
            { code: '160205', name: 'Claver' },
            { code: '160206', name: 'Dapa' },
            { code: '160207', name: 'Del Carmen' },
            { code: '160208', name: 'General Luna' },
            { code: '160209', name: 'Gigaquit' },
            { code: '160210', name: 'Mainit' },
            { code: '160211', name: 'Malimono' },
            { code: '160212', name: 'Pilar' },
            { code: '160213', name: 'Placer' },
            { code: '160214', name: 'San Benito' },
            { code: '160215', name: 'San Francisco' },
            { code: '160216', name: 'San Isidro' },
            { code: '160217', name: 'Santa Monica' },
            { code: '160218', name: 'Sison' },
            { code: '160219', name: 'Socorro' },
            { code: '160220', name: 'Tagana-an' },
            { code: '160221', name: 'Tubod' }
        ],
        '1603': [ // Surigao del Sur
            { code: '160301', name: 'Tandag City (Capital)' },
            { code: '160302', name: 'Bislig City' },
            { code: '160303', name: 'Barobo' },
            { code: '160304', name: 'Bayabas' },
            { code: '160305', name: 'Cagwait' },
            { code: '160306', name: 'Cantilan' },
            { code: '160307', name: 'Carmen' },
            { code: '160308', name: 'Carrascal' },
            { code: '160309', name: 'Cortes' },
            { code: '160310', name: 'Hinatuan' },
            { code: '160311', name: 'Lanuza' },
            { code: '160312', name: 'Lianga' },
            { code: '160313', name: 'Lingig' },
            { code: '160314', name: 'Madrid' },
            { code: '160315', name: 'Marihatag' },
            { code: '160316', name: 'San Agustin' },
            { code: '160317', name: 'San Miguel' },
            { code: '160318', name: 'Tagbina' },
            { code: '160319', name: 'Tago' }
        ],
        '1685': [ // Dinagat Islands
            { code: '168501', name: 'San Jose (Capital)' },
            { code: '168502', name: 'Basilisa' },
            { code: '168503', name: 'Cagdianao' },
            { code: '168504', name: 'Dinagat' },
            { code: '168505', name: 'Libjo' },
            { code: '168506', name: 'Loreto' },
            { code: '168507', name: 'Tubajon' }
        ]
    }
};

// Helper function to get provinces
function getProvinces() {
    return PSGC_DATA.provinces;
}

// Helper function to get LGUs by province code
function getLGUsByProvince(provinceCode) {
    return PSGC_DATA.lgus[provinceCode] || [];
}

// Helper function to get province name by code
function getProvinceName(provinceCode) {
    const province = PSGC_DATA.provinces.find(p => p.code === provinceCode);
    return province ? province.name : '';
}

// Helper function to get LGU name by code
function getLGUName(provinceCode, lguCode) {
    const lgus = getLGUsByProvince(provinceCode);
    const lgu = lgus.find(l => l.code === lguCode);
    return lgu ? lgu.name : '';
}
