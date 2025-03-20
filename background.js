// Background script for Sentry Team Member Extractor
// This script can be used for any background tasks or event listeners

// Enable debug mode
const DEBUG = true;

// Service worker specific code
self.importScripts('sentry-browser.min.js');

// Sentry initialization for background service worker
const SENTRY_DSN = "https://502e84b55edc7205b249295751427306@o88872.ingest.us.sentry.io/4509012075216896";

// Only initialize in production to avoid noise during development
const manifest = chrome.runtime.getManifest();
const isProduction = !manifest.version.includes('dev');

if (typeof Sentry !== 'undefined') {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: isProduction ? 'production' : 'development',
    enabled: true,
    release: `sentry-team-extractor@${manifest.version}`,
    
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        'extension_version': manifest.version,
        'browser': 'service-worker',
        'context': 'background'
      };
      return event;
    }
  });
  
  debugLog('Sentry initialized in background script');
} else {
  console.error('Sentry SDK not available in background script');
}

function debugLog(...args) {
  if (DEBUG) {
    console.log('[BACKGROUND DEBUG]', ...args);
  }
}

// Helper functions for error reporting in background script
const SentryHelpers = {
  captureException: function(error, context = {}) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, {
        extra: context
      });
    }
    debugLog('Error captured:', error, context);
  },
  
  captureMessage: function(message, level = 'info', context = {}) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureMessage(message, {
        level,
        extra: context
      });
    }
    debugLog(`${level.toUpperCase()} message:`, message, context);
  }
};

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  debugLog('Sentry Team Member Extractor installed');
  
  // Create a context menu item to open the dashboard
  chrome.contextMenus.create({
    id: "openDashboard",
    title: "Open PPV Tools Dashboard",
    contexts: ["action"]
  });
  
  // Log installation event to Sentry
  if (typeof Sentry !== 'undefined') {
    Sentry.captureMessage('Extension installed', 'info');
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openDashboard") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard.html")
    });
  }
});

// Listen for errors
self.addEventListener('error', function(event) {
  SentryHelpers.captureException(event.error || new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Listen for unhandled rejections
self.addEventListener('unhandledrejection', function(event) {
  SentryHelpers.captureException(event.reason || new Error('Unhandled Promise rejection'), {
    promise: 'unhandled'
  });
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