# Dog Care Tracker Web App

This simple web application helps you track two critical aspects of your dog's daily care:

1. **Water given:** A big, easily‑tapable button allows you to record the moment you provide water to your dog. The app stores the timestamp in the browser's local storage and shows the last recorded time on subsequent visits. Because data is stored with no expiration, it persists across sessions. A history view lists all recorded water events in reverse chronological order.
2. **Days since last inchident:** When an accident occurs, tap the inchident button to record the current timestamp. The app calculates the number of whole days that have passed since the last incident by subtracting the stored date from the current date and dividing by the number of milliseconds in a day.
5. **Best record:** The app keeps track of the longest streak of days without an accident (the “high score”). When the current streak surpasses the stored record, it updates automatically and persists in local storage.

## Features
 
- **Persistent storage:** Leveraging the `localStorage` API, the application stores timestamps locally on the device. Data remains available even if you close the page or restart the browser.
- **History and high score:** All water events are saved to an array in local storage using `JSON.stringify()` and `JSON.parse(). The incident tracker maintains a high score of the longest streak without an accident, updating and persisting it automatically.
- **Collapsible water history:** The water history section uses the native `<details>`/`<summary>` elements. Click on the “Water history” summary to expand or collapse the list, letting you hide it when not needed.
- **Export to CSV/Excel:** An **Export Records** button generates a CSV file containing the entire water history, the most recent incident, and the current high‑score. The export leverages the `Blob` API and programmatic anchor click to trigger a file download.
- **No indexing:** A `<meta name="robots" content="noindex, nofollow">` tag ensures that search engines do not index or follow links on the page.
- **Responsive design:** The layout and button sizes are optimized for tablet devices like an iPad mini. The interface is minimal, focusing on usability while avoiding clutter.
- **Automatic updates:** The days counter refreshes every minute so the displayed count stays accurate without needing to reload the page.

## How to use

1. Copy the contents of this folder (`index.html`, `styles.css`, `script.js`) onto your personal website. All three files should reside in the same directory.
2. Open `index.html` in a browser. It will load the CSS and JavaScript automatically.
3. Each time you give your dog water, press the **Record Water Given Now** button. The timestamp will update immediately and persist in local storage.
4. When an accident or vomiting incident occurs, press the **Record New Incident Now** button. The days counter will reset to `0` and increment automatically as days pass. If this new streak surpasses the previous best record, the “Best record” value will update.
5. If you need to clear the data, you can open the browser's developer console and call `localStorage.clear()`, or add your own reset button to the page.

## Notes

- The app uses the device’s local time zone. If multiple people use the same device (e.g., two owners sharing an iPad), they will see the same data because it relies on the device’s local storage.
- Because the page uses the `noindex, nofollow` directive, search engines should not crawl it. If you still encounter it in search results, ensure your hosting does not override the robots directive at the server level.
- For extended functionality—such as syncing data across devices—you would need a backend service or cloud storage. This basic version focuses on offline/standalone use.
