// Background script for Sentry Team Member Extractor
// This script can be used for any background tasks or event listeners

// Enable debug mode
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[BACKGROUND DEBUG]', ...args);
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  debugLog('Sentry Team Member Extractor installed');
  
  // Create a context menu item to open the dashboard
  chrome.contextMenus.create({
    id: "openDashboard",
    title: "Open PPV Tools Dashboard",
    contexts: ["action"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openDashboard") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard.html")
    });
  }
});

// Listen for messages from the popup and dashboard
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  debugLog('Message received:', request);
  
  if (request.action === 'fetchWithAuth') {
    debugLog('Fetch with auth requested for URL:', request.url);
    
    // Perform the fetch with authentication
    fetch(request.url, {
      method: request.method || 'GET',
      headers: request.headers || {},
      credentials: 'include'
    })
    .then(response => {
      debugLog('Response status:', response.status);
      return response.text();
    })
    .then(text => {
      try {
        const json = JSON.parse(text);
        debugLog('Response parsed as JSON:', json);
        sendResponse({success: true, data: json});
      } catch (e) {
        debugLog('Response is not JSON:', text);
        sendResponse({success: false, error: 'Invalid JSON', text: text});
      }
    })
    .catch(error => {
      debugLog('Fetch error:', error);
      sendResponse({success: false, error: error.toString()});
    });
    
    return true; // Keep the message channel open for the async response
  }
  
  // Handle opening dashboard from popup
  if (request.action === 'openDashboard') {
    try {
      chrome.tabs.create({
        url: chrome.runtime.getURL("dashboard.html")
      });
      debugLog('Dashboard opened successfully');
      sendResponse({success: true});
    } catch (error) {
      debugLog('Error opening dashboard:', error);
      sendResponse({success: false, error: error.toString()});
    }
    return true; // Keep the message channel open for the response
  }
  
  // Always send a response for unhandled messages to avoid "message port closed" errors
  if (!request.action || (request.action !== 'fetchWithAuth' && request.action !== 'openDashboard')) {
    debugLog('Unhandled message type:', request);
    sendResponse({success: false, error: 'Unhandled message type'});
    return false; // No need to keep the channel open
  }
});

// We could add more background functionality here if needed in the future
// For example, we could cache results or handle notifications 