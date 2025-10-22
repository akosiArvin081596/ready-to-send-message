// Form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthentication();

    // Get logged in province information
    const provinceCode = sessionStorage.getItem('provinceCode');
    const provinceName = sessionStorage.getItem('provinceName');

    // Display province name in header
    const provinceDisplay = document.getElementById('provinceDisplay');
    provinceDisplay.textContent = provinceName;

    // Form elements
    const reportForm = document.getElementById('reportForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const previewModal = document.getElementById('previewModal');
    const closeModalBtns = document.querySelectorAll('.close, .close-modal');
    const noCasualtiesCheckbox = document.getElementById('noCasualties');
    const casualtiesDetails = document.getElementById('casualtiesDetails');
    const alertCheckboxes = document.querySelectorAll('.alert-checkbox');

    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    reportForm.addEventListener('submit', handleSubmit);

    // Casualties checkbox handler
    if (noCasualtiesCheckbox) {
        console.log('noCasualtiesCheckbox found:', noCasualtiesCheckbox);
        console.log('casualtiesDetails found:', casualtiesDetails);
        noCasualtiesCheckbox.addEventListener('change', function() {
            console.log('Checkbox changed! Checked:', this.checked);
            if (this.checked) {
                console.log('Hiding casualties details');
                casualtiesDetails.style.display = 'none';
                casualtiesDetails.style.visibility = 'hidden';
                document.getElementById('injured').value = '';
                document.getElementById('wounded').value = '';
                document.getElementById('dead').value = '';
            } else {
                console.log('Showing casualties details');
                casualtiesDetails.style.display = 'block';
                casualtiesDetails.style.visibility = 'visible';
            }
        });
    } else {
        console.error('noCasualtiesCheckbox NOT found!');
    }

    // Alert checkbox handlers
    alertCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const remarksId = this.getAttribute('data-remarks');
            const remarksField = document.getElementById(remarksId);
            if (this.checked) {
                remarksField.style.display = 'block';
            } else {
                remarksField.style.display = 'none';
                // Clear remarks when unchecked
                const remarksInput = remarksField.querySelector('.remarks-input');
                if (remarksInput) {
                    remarksInput.value = '';
                }
            }
        });
    });

    // Close modal handlers
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    window.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closeModal();
        }
    });

    // Initialize coordination notes with default value
    document.getElementById('coordinationNotes').value = 'Coordination is ongoing with staff on the ground.';

    // Load existing report data when page loads
    loadExistingReport();

    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'index.html';
        }
    }

    async function loadExistingReport() {
        try {
            const response = await API.getReport(provinceCode);
            if (response.success && response.data) {
                populateFormData(response.data);
            }
        } catch (error) {
            console.log('No existing report found or error loading:', error.message);
        }
    }

    function populateFormData(data) {
        // Situation Overview
        if (data.situationOverview) {
            document.getElementById('situationOverview').value = data.situationOverview;
        }

        // Intensity
        if (data.intensity) {
            const intensitySelect = document.getElementById('intensity');
            if (intensitySelect) {
                intensitySelect.value = data.intensity;
            }
        }

        // Coordination Notes
        if (data.coordinationNotes) {
            document.getElementById('coordinationNotes').value = data.coordinationNotes;
        }

        // Affected Population
        if (data.affectedFamilies) document.getElementById('affectedFamilies').value = data.affectedFamilies;
        if (data.affectedPersons) document.getElementById('affectedPersons').value = data.affectedPersons;

        // Damaged Houses
        if (data.damagedTotally) document.getElementById('damagedTotally').value = data.damagedTotally;
        if (data.damagedPartially) document.getElementById('damagedPartially').value = data.damagedPartially;

        // Casualties
        if (data.noCasualties) {
            noCasualtiesCheckbox.checked = true;
            casualtiesDetails.style.display = 'none';
        } else {
            noCasualtiesCheckbox.checked = false;
            casualtiesDetails.style.display = 'block';
            if (data.injured) document.getElementById('injured').value = data.injured;
            if (data.wounded) document.getElementById('wounded').value = data.wounded;
            if (data.dead) document.getElementById('dead').value = data.dead;
        }

        // Alerts and Warnings
        if (data.tsunamiAlert) {
            document.querySelector('input[data-remarks="tsunamiRemarks"]').checked = true;
            document.getElementById('tsunamiRemarks').style.display = 'block';
            const tsunamiInput = document.getElementById('tsunamiRemarks').querySelector('.remarks-input');
            if (tsunamiInput && data.tsunamiRemarks) tsunamiInput.value = data.tsunamiRemarks;
        }

        if (data.suspensionAlert) {
            document.querySelector('input[data-remarks="suspensionRemarks"]').checked = true;
            document.getElementById('suspensionRemarks').style.display = 'block';
            const suspensionInput = document.getElementById('suspensionRemarks').querySelector('.remarks-input');
            if (suspensionInput && data.suspensionRemarks) suspensionInput.value = data.suspensionRemarks;
        }

        if (data.galeWarning) {
            document.querySelector('input[data-remarks="galeRemarks"]').checked = true;
            document.getElementById('galeRemarks').style.display = 'block';
            const galeInput = document.getElementById('galeRemarks').querySelector('.remarks-input');
            if (galeInput && data.galeRemarks) galeInput.value = data.galeRemarks;
        }

        if (data.powerInterruption) {
            document.querySelector('input[data-remarks="powerRemarks"]').checked = true;
            document.getElementById('powerRemarks').style.display = 'block';
            const powerInput = document.getElementById('powerRemarks').querySelector('.remarks-input');
            if (powerInput && data.powerRemarks) powerInput.value = data.powerRemarks;
        }

        if (data.waterInterruption) {
            document.querySelector('input[data-remarks="waterRemarks"]').checked = true;
            document.getElementById('waterRemarks').style.display = 'block';
            const waterInput = document.getElementById('waterRemarks').querySelector('.remarks-input');
            if (waterInput && data.waterRemarks) waterInput.value = data.waterRemarks;
        }
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout? Any unsaved data will be lost.')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    }

    function collectFormData() {
        const noCasualties = document.getElementById('noCasualties').checked;
        const tsunamiAlert = document.querySelector('input[data-remarks="tsunamiRemarks"]').checked;
        const suspensionAlert = document.querySelector('input[data-remarks="suspensionRemarks"]').checked;
        const galeWarning = document.querySelector('input[data-remarks="galeRemarks"]').checked;
        const powerInterruption = document.querySelector('input[data-remarks="powerRemarks"]').checked;
        const waterInterruption = document.querySelector('input[data-remarks="waterRemarks"]').checked;

        return {
            province: {
                code: provinceCode,
                name: provinceName
            },
            situationOverview: document.getElementById('situationOverview').value || null,
            intensity: document.getElementById('intensity').value || null,
            coordinationNotes: document.getElementById('coordinationNotes').value || null,
            affectedFamilies: parseInt(document.getElementById('affectedFamilies').value) || 0,
            affectedPersons: parseInt(document.getElementById('affectedPersons').value) || 0,
            damagedTotally: parseInt(document.getElementById('damagedTotally').value) || 0,
            damagedPartially: parseInt(document.getElementById('damagedPartially').value) || 0,
            noCasualties: noCasualties,
            injured: noCasualties ? 0 : (parseInt(document.getElementById('injured').value) || 0),
            wounded: noCasualties ? 0 : (parseInt(document.getElementById('wounded').value) || 0),
            dead: noCasualties ? 0 : (parseInt(document.getElementById('dead').value) || 0),
            tsunamiAlert: tsunamiAlert,
            tsunamiRemarks: tsunamiAlert ? document.getElementById('tsunamiRemarks').querySelector('.remarks-input').value : null,
            suspensionAlert: suspensionAlert,
            suspensionRemarks: suspensionAlert ? document.getElementById('suspensionRemarks').querySelector('.remarks-input').value : null,
            galeWarning: galeWarning,
            galeRemarks: galeWarning ? document.getElementById('galeRemarks').querySelector('.remarks-input').value : null,
            powerInterruption: powerInterruption,
            powerRemarks: powerInterruption ? document.getElementById('powerRemarks').querySelector('.remarks-input').value : null,
            waterInterruption: waterInterruption,
            waterRemarks: waterInterruption ? document.getElementById('waterRemarks').querySelector('.remarks-input').value : null
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = collectFormData();

        // Show confirmation message
        if (confirm('Submit earthquake progress report for ' + provinceName + '?')) {
            try {
                // Update the report
                const response = await API.updateReport(formData);

                // Show success alert
                alert('Report submitted successfully!');

                // Log for debugging
                console.log('Form Data:', formData);
                console.log('API Response:', response);
            } catch (error) {
                console.error('Submission error:', error);
                alert('Failed to submit report: ' + error.message + '\n\nMake sure the server is running.');
            }
        }
    }

    function closeModal() {
        previewModal.classList.remove('active');
    }

});
