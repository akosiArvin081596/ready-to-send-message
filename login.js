// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const provinceSelect = document.getElementById('province');

    // Populate province dropdown
    populateProvinces();

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    function populateProvinces() {
        const provinces = getProvinces();

        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.code;
            option.textContent = province.name;
            provinceSelect.appendChild(option);
        });
    }

    function handleLogin() {
        const selectedProvinceCode = provinceSelect.value;

        if (!selectedProvinceCode) {
            alert('Please select a province');
            return;
        }

        const selectedProvinceName = getProvinceName(selectedProvinceCode);

        // Store login information in sessionStorage
        sessionStorage.setItem('provinceCode', selectedProvinceCode);
        sessionStorage.setItem('provinceName', selectedProvinceName);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loginTime', new Date().toISOString());

        // Redirect to dashboard page
        window.location.href = 'dashboard.html';
    }
});
