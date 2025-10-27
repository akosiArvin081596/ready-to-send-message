// Consolidator Dashboard functionality
document.addEventListener('DOMContentLoaded', function () {
	// Handle card clicks
	setupCardHandlers();

	// Setup logout button
	setupLogout();
});

function setupCardHandlers() {
	const cards = document.querySelectorAll('.disaster-card');

	cards.forEach((card) => {
		card.addEventListener('click', function () {
			// Only handle clicks on active cards
			if (this.classList.contains('disabled')) {
				return;
			}

			const disasterType = this.dataset.type;

			// Store the selected disaster type in session storage
			sessionStorage.setItem('selectedDisasterType', disasterType);

			// Navigate to consolidated reports page
			window.location.href = 'consolidated.html';
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
