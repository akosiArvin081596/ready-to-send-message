// Dashboard functionality
document.addEventListener('DOMContentLoaded', function () {
	// Check if user is logged in
	checkAuthentication();

	// Display province name
	displayProvinceName();

	// Handle card clicks
	setupCardHandlers();

	// Setup logout button
	setupLogout();
});

function checkAuthentication() {
	const isLoggedIn = sessionStorage.getItem('isLoggedIn');
	const provinceCode = sessionStorage.getItem('provinceCode');

	if (!isLoggedIn || !provinceCode) {
		// Redirect to login page if not authenticated
		window.location.href = 'index.html';
		return;
	}
}

function displayProvinceName() {
	const provinceName = sessionStorage.getItem('provinceName');
	const provinceDisplay = document.getElementById('provinceDisplay');

	if (provinceName && provinceDisplay) {
		provinceDisplay.textContent = provinceName;
	}
}

function setupCardHandlers() {
	const cards = document.querySelectorAll('.disaster-card');

	cards.forEach((card) => {
		card.addEventListener('click', function () {
			// Only handle clicks on active cards
			if (this.classList.contains('disabled')) {
				return;
			}

			const disasterType = this.dataset.type;

			// Handle navigation based on disaster type
			switch (disasterType) {
				case 'earthquake':
					// Redirect to earthquake form
					window.location.href = 'form.html';
					break;
				case 'weather':
					// Redirect to weather disturbance form
					window.location.href = 'weather-form.html';
					break;
				default:
					console.log('Unknown disaster type:', disasterType);
			}
		});

		// Add hover effect for active cards
		if (!card.classList.contains('disabled')) {
			card.style.cursor = 'pointer';
		}
	});
}

function setupLogout() {
	const logoutBtn = document.getElementById('logoutBtn');

	if (logoutBtn) {
		logoutBtn.addEventListener('click', function () {
			// Clear all session storage
			sessionStorage.clear();

			// Redirect to login page
			window.location.href = 'index.html';
		});
	}
}
