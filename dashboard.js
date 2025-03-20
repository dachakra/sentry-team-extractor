document.addEventListener('DOMContentLoaded', function() {
  // Log when Looker iframe loads
  const lookerIframe = document.querySelector('.looker-iframe');
  if (lookerIframe) {
    lookerIframe.addEventListener('load', function() {
      console.log('Looker dashboard loaded successfully');
    });
    
    lookerIframe.addEventListener('error', function(e) {
      console.error('Error loading Looker dashboard:', e);
    });
  }
  
  // Add event listener for the back button
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.close();
    });
  }
});
