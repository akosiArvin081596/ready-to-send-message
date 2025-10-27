/**
 * Loading Screen Utility
 * Provides full-screen loading overlay with real-time progress tracking
 */

// Global progress tracking
let progressValue = 0;
let progressInterval = null;

// Initialize loading overlay on page load
function initLoadingOverlay() {
	// Create loading overlay if it doesn't exist
	if (!document.getElementById("loadingOverlay")) {
		const overlay = document.createElement("div");
		overlay.id = "loadingOverlay";
		overlay.className = "loading-overlay";
		overlay.innerHTML = `
            <div style="position: relative;">
                <div class="loading-spinner">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class="loading-text">Loading...</div>
                <div class="loading-progress-container">
                    <div class="loading-progress-bar">
                        <div class="loading-progress-fill" id="progressFill"></div>
                    </div>
                    <div class="loading-progress-text" id="progressText">0%</div>
                </div>
            </div>
        `;
		document.body.appendChild(overlay);
	}
}

// Update progress bar
function updateProgress(percent) {
	const progressFill = document.getElementById("progressFill");
	const progressText = document.getElementById("progressText");

	if (progressFill && progressText) {
		progressValue = Math.min(percent, 100);
		progressFill.style.width = progressValue + "%";
		progressText.textContent = Math.round(progressValue) + "%";
	}
}

// Show loading overlay
function showLoading(text = "Loading...") {
	const overlay = document.getElementById("loadingOverlay");
	if (overlay) {
		const loadingText = overlay.querySelector(".loading-text");
		if (loadingText) {
			loadingText.textContent = text;
		}
		// Reset progress
		progressValue = 0;
		updateProgress(0);
		// Small delay to ensure DOM is ready
		setTimeout(() => {
			overlay.classList.add("show");
		}, 10);
	}
}

// Hide loading overlay
function hideLoading() {
	const overlay = document.getElementById("loadingOverlay");
	if (overlay) {
		// Ensure we hit 100% before hiding
		updateProgress(100);
		setTimeout(() => {
			overlay.classList.remove("show");
		}, 300);
	}
}

// Track page loading progress
function trackLoadingProgress() {
	let startTime = performance.now();
	let resourcesLoaded = 0;
	let totalResources = 0;

	// Count total resources to load
	const images = document.images.length;
	const scripts = document.scripts.length;
	const stylesheets = document.styleSheets.length;
	totalResources = images + scripts + stylesheets;

	// Initial progress based on DOM ready state
	if (document.readyState === "loading") {
		updateProgress(10);
	} else if (document.readyState === "interactive") {
		updateProgress(40);
	}

	// Track resource loading
	const trackResource = () => {
		resourcesLoaded++;
		const resourceProgress = totalResources > 0 ? (resourcesLoaded / totalResources) * 50 : 0;
		const baseProgress = 40;
		updateProgress(baseProgress + resourceProgress);
	};

	// Monitor image loads
	Array.from(document.images).forEach((img) => {
		if (img.complete) {
			trackResource();
		} else {
			img.addEventListener("load", trackResource);
			img.addEventListener("error", trackResource);
		}
	});

	// Estimate progress with time-based fallback
	const estimateProgress = () => {
		const elapsed = performance.now() - startTime;
		const timeBasedProgress = Math.min(elapsed / 20, 90); // Cap at 90%

		if (progressValue < timeBasedProgress) {
			updateProgress(timeBasedProgress);
		}
	};

	// Update progress estimation every 100ms
	progressInterval = setInterval(() => {
		if (progressValue < 90) {
			estimateProgress();
		}
	}, 100);
}

// Clear progress interval
function clearProgressTracking() {
	if (progressInterval) {
		clearInterval(progressInterval);
		progressInterval = null;
	}
}

// Start loading on page initialization
if (document.readyState === "loading") {
	initLoadingOverlay();
	showLoading();
	trackLoadingProgress();
}

// Handle different page load states
window.addEventListener("DOMContentLoaded", () => {
	if (!document.getElementById("loadingOverlay")) {
		initLoadingOverlay();
		showLoading();
	}
	updateProgress(50);
	trackLoadingProgress();
});

window.addEventListener("load", () => {
	// Page fully loaded
	clearProgressTracking();
	updateProgress(100);
	// Hide loading after showing 100%
	setTimeout(hideLoading, 400);
});

// Show loading when navigating away from the page
window.addEventListener("beforeunload", () => {
	clearProgressTracking();
	showLoading("Loading...");
	// Quick progress simulation for navigation
	updateProgress(30);
});

// Handle visibility changes (for back/forward navigation)
document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		clearProgressTracking();
	}
});

// Export functions for use in other scripts
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		showLoading,
		hideLoading,
		initLoadingOverlay,
		updateProgress
	};
}
