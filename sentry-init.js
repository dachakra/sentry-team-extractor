// Initialize Sentry for error monitoring in Chrome Extension
// This file should be loaded before other scripts

// Global Sentry initialization
const SENTRY_DSN = "https://502e84b55edc7205b249295751427306@o88872.ingest.us.sentry.io/4509012075216896";

// Initialize Sentry if the SDK is loaded
function initSentry() {
  if (typeof Sentry !== 'undefined') {
    // Only initialize in production to avoid noise during development
    const manifest = chrome.runtime.getManifest();
    const isProduction = !manifest.version.includes('dev');
    
    Sentry.init({
      dsn: SENTRY_DSN,
      
      // Set tracesSampleRate to capture transactions for performance monitoring
      tracesSampleRate: 1,
      
      // Set environment based on the extension version
      environment: isProduction ? 'production' : 'development',
      
      // Always enabled for now (can be changed to isProduction if needed)
      enabled: true,
      
      // Add release information
      release: `sentry-team-extractor@${manifest.version}`,
      
      // Capture user information (non-PII)
      beforeSend(event) {
        // Add extension-specific context
        event.tags = {
          ...event.tags,
          'extension_version': manifest.version,
          'browser': navigator.userAgent,
          'context': window.location.pathname.includes('popup') ? 'popup' : 
                     window.location.pathname.includes('dashboard') ? 'dashboard' : 'background'
        };
        return event;
      }
    });
    
    console.log('Sentry initialized for', window.location.pathname);
  } else {
    console.error('Sentry SDK not loaded');
  }
}

// Helper functions for easier error reporting
window.SentryHelpers = {
  // Capture an exception with additional context
  captureException: function(error, context = {}) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, {
        extra: context
      });
    } else {
      console.error('Error (Sentry not loaded):', error, context);
    }
  },
  
  // Manually capture a message
  captureMessage: function(message, level = 'info', context = {}) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureMessage(message, {
        level,
        extra: context
      });
    } else {
      console.log(`${level.toUpperCase()} (Sentry not loaded):`, message, context);
    }
  },
  
  // Add breadcrumb for better error context
  addBreadcrumb: function(message, category = 'ui.click', level = 'info', data = {}) {
    if (typeof Sentry !== 'undefined') {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        data
      });
    }
  }
};

// Auto-initialize when the script loads
document.addEventListener('DOMContentLoaded', initSentry); 