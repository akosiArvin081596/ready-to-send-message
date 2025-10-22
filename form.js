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

    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    reportForm.addEventListener('submit', handleSubmit);

    // Close modal handlers
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    window.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closeModal();
        }
    });

    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'index.html';
        }
    }


    function handleLogout() {
        if (confirm('Are you sure you want to logout? Any unsaved data will be lost.')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    }

    function collectFormData() {
        const situationOverview = document.getElementById('situationOverview').value;

        return {
            province: {
                code: provinceCode,
                name: provinceName
            },
            situationOverview: situationOverview
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = collectFormData();

        // Show success message
        if (confirm('Submit disaster report?')) {
            try {
                // Save to API
                const response = await API.createReport(formData);

                // Show success alert
                alert('Report submitted successfully!');

                // Clear form
                reportForm.reset();
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
