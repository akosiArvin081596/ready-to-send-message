// Consolidated Reports View
document.addEventListener("DOMContentLoaded", function () {
	const noDataMessage = document.getElementById("noDataMessage");
	const copyableData = document.getElementById("copyableData");
	const copyDataBtn = document.getElementById("copyDataBtn");
	const resetDataBtn = document.getElementById("resetDataBtn");
	const provincesContainer = document.getElementById("provincesContainer");

	// Initialize
	loadReports();

	// Event Listeners
	copyDataBtn.addEventListener("click", copyToClipboard);
	resetDataBtn.addEventListener("click", resetAllData);

	async function loadReports() {
		try {
			const response = await API.getAllReports();
			const reports = response.data;

			if (!reports || reports.length === 0) {
				noDataMessage.style.display = "block";
				copyableData.value = "No data available";
				return;
			}

			noDataMessage.style.display = "none";
			generateReportView(reports);
			generateCopyableText(reports);
		} catch (error) {
			console.error("Error loading reports:", error);
			noDataMessage.style.display = "block";
			noDataMessage.textContent =
				"Failed to load reports. Make sure the server is running.";
			copyableData.value =
				"Failed to load data. Please check server connection.";
		}
	}

	function parseReportData(situationOverviewJSON) {
		try {
			return JSON.parse(situationOverviewJSON);
		} catch (e) {
			return null;
		}
	}

	function pluralize(count, singular, plural) {
		return count === 1 ? singular : plural;
	}

	function generateReportView(reports) {
		// Group reports by province
		const reportsByProvince = {};
		reports.forEach((report) => {
			const provinceName = report.province.name;
			if (!reportsByProvince[provinceName]) {
				reportsByProvince[provinceName] = report;
			}
		});

		// Display each province's data
		const sortedProvinces = Object.keys(reportsByProvince).sort();

		sortedProvinces.forEach((provinceName) => {
			const report = reportsByProvince[provinceName];
			const reportData = parseReportData(report.situationOverview);

			if (reportData) {
				const provinceDiv = document.createElement("div");
				provinceDiv.className = "form-section";
				provinceDiv.style.cssText = "background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;";

				let html = `<h3 style="margin-top: 0">${provinceName}</h3>`;

				// Intensity
				if (reportData.intensity) {
					html += `<p><strong>Intensity:</strong> ${reportData.intensity}</p>`;
				}

				// Affected Population
				if (reportData.affectedFamilies || reportData.affectedPersons) {
					const families = reportData.affectedFamilies || 0;
					const persons = reportData.affectedPersons || 0;
					const familiesLabel = pluralize(families, 'family', 'families');
					const personsLabel = pluralize(persons, 'person', 'persons');
					html += `<p><strong>Affected Population:</strong> ${families} ${familiesLabel} or ${persons} ${personsLabel}</p>`;
				}

				// Damaged Houses - Always display with 0 for null/zero/blank
				const damagedTotally = reportData.damagedTotally || 0;
				const damagedPartially = reportData.damagedPartially || 0;
				html += `<p><strong>Damaged Houses:</strong> ${damagedTotally} totally damaged, ${damagedPartially} partially damaged</p>`;

				// Casualties
				if (reportData.noCasualties) {
					html += `<p><strong>Casualties:</strong> None</p>`;
				} else {
					const casualties = [];
					if (reportData.injured > 0) casualties.push(`${reportData.injured} injured`);
					if (reportData.wounded > 0) casualties.push(`${reportData.wounded} wounded`);
					if (reportData.dead > 0) casualties.push(`${reportData.dead} dead`);

					if (casualties.length > 0) {
						html += `<p><strong>Casualties:</strong> ${casualties.join(", ")}</p>`;
					} else {
						html += `<p><strong>Casualties:</strong> None</p>`;
					}
				}

				// Alerts and Warnings
				const alerts = [];
				if (reportData.tsunamiAlert) alerts.push(`Tsunami Alert: ${reportData.tsunamiAlert}`);
				if (reportData.suspensionAlert) alerts.push(`Work and Class Suspension: ${reportData.suspensionAlert}`);
				if (reportData.galeWarning) alerts.push(`Gale Warning: ${reportData.galeWarning}`);
				if (reportData.powerInterruption) alerts.push(`Power Interruption: ${reportData.powerInterruption}`);
				if (reportData.waterInterruption) alerts.push(`Water Interruption: ${reportData.waterInterruption}`);

				if (alerts.length > 0) {
					html += `<div style="background: white; padding: 0.75rem; border-radius: 6px; margin-top: 0.75rem;">`;
					alerts.forEach(alert => {
						html += `<p style="margin: 0.5rem 0; font-size: 0.875rem">${alert}</p>`;
					});
					html += `</div>`;
				}

				provinceDiv.innerHTML = html;
				provincesContainer.appendChild(provinceDiv);
			}
		});
	}

	function generateCopyableText(reports) {
		let text = "Good day, Sec. Rex.\n\n";
		text += "Following the magnitude ___ earthquake that was recorded in __________ , here are the latest situation updates per province:\n\n";

		// Group reports by province
		const reportsByProvince = {};
		reports.forEach((report) => {
			const provinceName = report.province.name;
			if (!reportsByProvince[provinceName]) {
				reportsByProvince[provinceName] = report;
			}
		});

		// Display each province's data
		const sortedProvinces = Object.keys(reportsByProvince).sort();

		sortedProvinces.forEach((provinceName) => {
			const report = reportsByProvince[provinceName];

			// Province name
			text += `${provinceName}\n\n`;

			// Province Situation Overview
			if (report.situationOverview) {
				text += `${report.situationOverview}\n\n`;
			} else {
				text += `[Province situation overview needed]\n\n`;
			}

			// Intensity Level
			if (report.intensity) {
				text += `${report.intensity}\n\n`;
			} else {
				text += `[Intensity level needed]\n\n`;
			}

			// Coordination Notes
			if (report.coordinationNotes) {
				text += `${report.coordinationNotes}\n`;
			} else {
				text += `[Coordination notes needed]\n`;
			}

		const families = report.affectedFamilies || 0;
		const persons = report.affectedPersons || 0;
		const familiesLabel = pluralize(families, 'family', 'families');
		const personsLabel = pluralize(persons, 'person', 'persons');
		text += `\nAffected Population: ${families} ${familiesLabel} or ${persons} ${personsLabel}\n`;
		const damagedTotally = report.damagedTotally || 0;
		const damagedPartially = report.damagedPartially || 0;
		text += `Damaged Houses: ${damagedTotally} totally damaged, ${damagedPartially} partially damaged\n`;

		// Casualties
		if (report.noCasualties) {
			text += `Casualties: None\n`;
		} else {
			const injured = report.injured || 0;
			const wounded = report.wounded || 0;
			const dead = report.dead || 0;
			if (injured > 0 || wounded > 0 || dead > 0) {
				text += `Casualties: ${injured} injured / ${wounded} wounded / ${dead} dead\n`;
			} else {
				text += `Casualties: None\n`;
			}
		}

		// Alerts and Warnings
		text += `\nTsunami Alert: ${report.tsunamiRemarks || 'No Tsunami Alert'}\n`;
		text += `Work and Class Suspension: ${report.suspensionRemarks || 'No Work and Class Suspension'}\n`;
		text += `Gale Warning: ${report.galeRemarks || 'No Gale Warning'}\n`;
		text += `Power Interruption: ${report.powerRemarks || 'No Power Interruption'}\n`;
		text += `Water Interruption: ${report.waterRemarks || 'No Water Interruption'}\n`;

		text += "\n" + "- ".repeat(10).trim() + "\n\n";
	});

		copyableData.value = text.trim();
	}

	function copyToClipboard() {
		copyableData.select();
		copyableData.setSelectionRange(0, 99999); // For mobile devices

		try {
			document.execCommand("copy");

			// Visual feedback
			const originalText = copyDataBtn.textContent;
			copyDataBtn.textContent = "✓ Copied!";
			copyDataBtn.style.background = "var(--success-color)";

			setTimeout(() => {
				copyDataBtn.textContent = originalText;
				copyDataBtn.style.background = "";
			}, 2000);
		} catch (err) {
			alert("Failed to copy. Please manually select and copy the text.");
		}
	}

	async function resetAllData() {
		// Confirmation dialog
		const confirmed = confirm("⚠️ Are you sure you want to reset all data to default values? This action cannot be undone.");
		if (!confirmed) {
			return;
		}

		try {
			// Disable button and show loading state
			const originalText = resetDataBtn.textContent;
			resetDataBtn.disabled = true;
			resetDataBtn.textContent = "Resetting...";

			// Call API to reset all reports
			await API.resetAllReports();

			// Show success feedback
			resetDataBtn.textContent = "✓ Data Reset!";
			resetDataBtn.style.background = "var(--success-color)";

			// Reload the page after a short delay
			setTimeout(() => {
				location.reload();
			}, 1500);
		} catch (error) {
			console.error("Error resetting data:", error);
			alert("Failed to reset data. Please try again.");

			// Reset button state
			resetDataBtn.disabled = false;
			resetDataBtn.textContent = originalText;
		}
	}
});
