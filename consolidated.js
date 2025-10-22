// Consolidated Reports View
document.addEventListener("DOMContentLoaded", function () {
	const noDataMessage = document.getElementById("noDataMessage");
	const copyableData = document.getElementById("copyableData");
	const copyDataBtn = document.getElementById("copyDataBtn");

	// Initialize
	loadReports();

	// Event Listeners
	copyDataBtn.addEventListener("click", copyToClipboard);

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

	function generateCopyableText(reports) {
		let text = "";

		// Group reports by province
		const reportsByProvince = {};
		reports.forEach((report) => {
			const provinceName = report.province.name;
			if (!reportsByProvince[provinceName]) {
				reportsByProvince[provinceName] = [];
			}
			reportsByProvince[provinceName].push(report);
		});

		// Display each province's data
		Object.keys(reportsByProvince)
			.sort()
			.forEach((provinceName, provinceIndex) => {
				const provinceReports = reportsByProvince[provinceName];

				// Add province name
				text += `${provinceName}\n`;

				// Display each report
				provinceReports.forEach((report, index) => {
					// Add situation overview
					if (report.situationOverview) {
						text += `Province Situation Overview: ${report.situationOverview}\n\n`;
					}

					if (report.lguData && report.lguData.length > 0) {
						report.lguData.forEach((lgu, lguIndex) => {
							text += `${lguIndex + 1}. ${lgu.lguName}\n`;
							text += `   Affected Families: ${lgu.affectedFamilies.toLocaleString()}\n`;
							text += `   Affected Individuals: ${lgu.affectedIndividuals.toLocaleString()}\n`;
							text += `   Damaged Houses (Partial): ${lgu.damagedHousesPartial.toLocaleString()}\n`;
							text += `   Damaged Houses (Total): ${lgu.damagedHousesTotal.toLocaleString()}\n`;
							text += `   Casualties - Injured: ${lgu.casualtiesInjured.toLocaleString()}\n`;
							text += `   Casualties - Wounded: ${lgu.casualtiesWounded.toLocaleString()}\n`;
							text += `   Casualties - Dead: ${lgu.casualtiesDead.toLocaleString()}\n\n`;
						});
					}
				});

				// Add extra line break between provinces
				if (provinceIndex < Object.keys(reportsByProvince).length - 1) {
					text += "\n";
				}
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
});
