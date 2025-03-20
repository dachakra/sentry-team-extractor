document.addEventListener('DOMContentLoaded', function() {
  // Try to initialize Sentry explicitly if needed
  if (typeof Sentry === 'undefined' && window.SentryHelpers === undefined) {
    console.error('Sentry not loaded properly in dashboard');
  } else {
    // Add initial breadcrumb for page load
    if (window.SentryHelpers) {
      window.SentryHelpers.addBreadcrumb('Dashboard opened', 'navigation', 'info');
      window.SentryHelpers.captureMessage('Dashboard viewed', 'info');
    }
  }

  // Log when Looker iframe loads
  const lookerIframe = document.querySelector('.looker-iframe');
  if (lookerIframe) {
    lookerIframe.addEventListener('load', function() {
      console.log('Looker dashboard loaded successfully');
      if (window.SentryHelpers) {
        window.SentryHelpers.addBreadcrumb('Looker iframe loaded', 'ui.load', 'info');
      }
    });
    
    lookerIframe.addEventListener('error', function(e) {
      console.error('Error loading Looker dashboard:', e);
      if (window.SentryHelpers) {
        window.SentryHelpers.captureException(e, {
          element: 'looker-iframe',
          src: lookerIframe.src
        });
      }
    });
  }
  
  // Add event listener for the back button
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      try {
        e.preventDefault();
        if (window.SentryHelpers) {
          window.SentryHelpers.addBreadcrumb('Back button clicked', 'ui.click', 'info');
        }
        window.close();
      } catch (error) {
        if (window.SentryHelpers) {
          window.SentryHelpers.captureException(error, {
            element: 'back-button',
            action: 'close window'
          });
        }
        console.error('Error closing window:', error);
      }
    });
  }
  
  // Error tracking for window errors
  window.addEventListener('error', function(e) {
    if (window.SentryHelpers) {
      window.SentryHelpers.captureException(e.error || new Error(e.message), {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    }
  });
});
