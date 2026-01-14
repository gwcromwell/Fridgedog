// Keys used to persist timestamps in localStorage. The data is saved
// indefinitely, meaning it remains available even after the browser
// window is closed【802708823034692†L1250-L1272】.
const WATER_KEY = 'dogcare_lastWaterTimestamp';
const INCIDENT_KEY = 'dogcare_lastIncidentTimestamp';

// New keys for tracking water history and best incident streak (high score).
const WATER_HISTORY_KEY = 'dogcare_waterHistory';
const HIGH_SCORE_KEY = 'dogcare_highScore';

/**
 * Format a Date object into a human‑readable string using the user's locale.
 * The default options provide medium length date and short time for clarity.
 *
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date/time string.
 */
function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Compute the number of whole days between two Date objects. The GeeksforGeeks
 * article describes how to calculate the difference by subtracting one date
 * from another to get the time difference in milliseconds and dividing by
 * 86,400,000 (the number of milliseconds in a day)【306253394922157†L38-L45】.
 *
 * @param {Date} start - The earlier date.
 * @param {Date} end - The later date.
 * @returns {number} Whole number of days between the two dates.
 */
function differenceInDays(start, end) {
  const diffMs = end - start;
  // floor instead of ceil since we want completed days since the incident
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Update the text content of the display elements based on saved data.
 * If no data exists, fallback text is shown.
 */
function updateDisplays() {
  const lastWaterTimestamp = localStorage.getItem(WATER_KEY);
  const lastIncidentTimestamp = localStorage.getItem(INCIDENT_KEY);

  const lastWaterDisplay = document.getElementById('lastWaterDisplay');
  const daysDisplay = document.getElementById('daysDisplay');

  if (lastWaterTimestamp) {
    const lastDate = new Date(parseInt(lastWaterTimestamp, 10));
    lastWaterDisplay.textContent = formatDateTime(lastDate);
  } else {
    lastWaterDisplay.textContent = 'No record yet';
  }

  if (lastIncidentTimestamp) {
    const lastIncidentDate = new Date(parseInt(lastIncidentTimestamp, 10));
    const now = new Date();
    const days = differenceInDays(lastIncidentDate, now);
    daysDisplay.textContent = days.toString();
    // Update the high score if this streak is a new record.
    updateHighScore(days);
  } else {
    daysDisplay.textContent = 'No incident';
  }

  // Always update the water history display when the page is drawn.
  updateWaterHistoryDisplay();
  // Ensure high score display is populated on first load.
  showHighScore();
}

// Event listeners for recording a new water event or incident. Saving the
// current timestamp to localStorage ensures persistence across sessions. After
// saving, we immediately update the displays to reflect the new data.
document.getElementById('waterButton').addEventListener('click', () => {
  const now = Date.now();
  localStorage.setItem(WATER_KEY, now.toString());
  // Update water history: prepend current timestamp to the array and save
  const history = getWaterHistory();
  // Add the new event at the beginning so the most recent appears first
  history.unshift(now);
  saveWaterHistory(history);
  updateDisplays();
});

document.getElementById('incidentButton').addEventListener('click', () => {
  const now = Date.now();
  localStorage.setItem(INCIDENT_KEY, now.toString());
  updateDisplays();
});

// Event listener for exporting records to CSV
const exportBtn = document.getElementById('exportButton');
if (exportBtn) {
  exportBtn.addEventListener('click', exportRecords);
}

// Initialize displays on page load. Also update every minute so the days
// counter remains accurate as time passes.
updateDisplays();
setInterval(updateDisplays, 60 * 1000);

/**
 * Assemble a CSV string from the saved water history, last incident timestamp
 * and high score, then trigger a download. The GeeksforGeeks article on
 * creating and downloading CSV files shows that a Blob can be created with
 * `text/csv` MIME type and downloaded by constructing a URL and
 * programmatically clicking an anchor element【613516986560888†L168-L184】.
 */
function exportRecords() {
  const rows = [];
  // Header row
  rows.push(['Record Type', 'Timestamp', 'Date/Time']);

  // Water history
  const waterHistory = getWaterHistory();
  waterHistory.forEach((ts) => {
    const date = new Date(ts);
    rows.push(['Water', ts.toString(), formatDateTime(date)]);
  });

  // Last incident
  const incidentTsStr = localStorage.getItem(INCIDENT_KEY);
  if (incidentTsStr) {
    const incidentDate = new Date(parseInt(incidentTsStr, 10));
    rows.push(['Last Incident', incidentTsStr, formatDateTime(incidentDate)]);
  }

  // High score
  const highScoreStr = localStorage.getItem(HIGH_SCORE_KEY) || '0';
  rows.push(['High Score (days)', '', highScoreStr]);

  // Convert rows into CSV string. Escape fields that contain quotes or commas.
  const csvContent = rows
    .map((row) =>
      row
        .map((field) => {
          const safeField = String(field).replace(/"/g, '""');
          return `"${safeField}"`;
        })
        .join(',')
    )
    .join('\n');

  // Create a Blob and trigger the download【613516986560888†L168-L184】.
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Give the file a name with the current date and time
  const now = new Date();
  const fileName = `dogcare_records_${
    now.toISOString().split('T')[0]
  }.csv`;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Retrieve the stored array of water timestamps from localStorage. If none exist
 * or the stored value is malformed, an empty array is returned. Storing
 * arrays/objects requires converting them into JSON strings using
 * `JSON.stringify()` before saving and parsing them back with
 * `JSON.parse()` when reading【636184699436812†L1046-L1055】.
 *
 * @returns {number[]} Array of UNIX timestamps representing water events.
 */
function getWaterHistory() {
  const historyString = localStorage.getItem(WATER_HISTORY_KEY);
  if (historyString) {
    try {
      const parsed = JSON.parse(historyString);
      // Validate that it's an array of numbers
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse water history:', e);
    }
  }
  return [];
}

/**
 * Save the provided array of water timestamps into localStorage. The array is
 * converted into a JSON string via `JSON.stringify()`【636184699436812†L1046-L1055】.
 *
 * @param {number[]} history - Array of UNIX timestamps.
 */
function saveWaterHistory(history) {
  localStorage.setItem(WATER_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Render the water history list to the page. Items are displayed in
 * chronological order (most recent first).
 */
function updateWaterHistoryDisplay() {
  const listElem = document.getElementById('waterHistoryList');
  // Avoid errors if the element is not found
  if (!listElem) return;
  const history = getWaterHistory();
  // Clear existing content
  listElem.innerHTML = '';
  history.forEach((timestamp) => {
    const li = document.createElement('li');
    const date = new Date(timestamp);
    li.textContent = formatDateTime(date);
    listElem.appendChild(li);
  });
}

/**
 * Update the high score display if the current streak surpasses the stored
 * record. The high score is saved in localStorage so it persists across
 * sessions.
 *
 * @param {number} currentDays - Current streak of days without incident.
 */
function updateHighScore(currentDays) {
  const highScoreStr = localStorage.getItem(HIGH_SCORE_KEY);
  let highScore = 0;
  if (highScoreStr) {
    const parsed = parseInt(highScoreStr, 10);
    if (!isNaN(parsed)) highScore = parsed;
  }
  if (currentDays > highScore) {
    highScore = currentDays;
    localStorage.setItem(HIGH_SCORE_KEY, highScore.toString());
  }
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  if (highScoreDisplay) {
    highScoreDisplay.textContent = highScore.toString();
  }
}

/**
 * Populate the high score display on page load.
 */
function showHighScore() {
  const highScoreStr = localStorage.getItem(HIGH_SCORE_KEY);
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  if (highScoreDisplay) {
    if (highScoreStr && !isNaN(parseInt(highScoreStr, 10))) {
      highScoreDisplay.textContent = parseInt(highScoreStr, 10).toString();
    } else {
      highScoreDisplay.textContent = '0';
    }
  }
}