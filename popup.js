document.addEventListener('DOMContentLoaded', function() {
  // Try to initialize Sentry explicitly if needed
  if (typeof Sentry === 'undefined' && window.SentryHelpers === undefined) {
    console.error('Sentry not loaded properly in popup');
  } else {
    // Add initial breadcrumb
    if (window.SentryHelpers) {
      window.SentryHelpers.addBreadcrumb('Popup opened', 'navigation', 'info');
    }
  }

  const extractBtn = document.getElementById('extract-btn');
  const openDashboardBtn = document.getElementById('open-dashboard-btn');
  const orgSlugInput = document.getElementById('org-slug');
  const projectSlugInput = document.getElementById('project-slug');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const filterSection = document.getElementById('filter-section');
  const permissionFilters = document.querySelectorAll('.permission-filter');
  const selectAllBtn = document.getElementById('select-all-permissions');
  const selectNoneBtn = document.getElementById('select-none-permissions');
  
  // Debug elements
  const debugToggle = document.getElementById('debug-toggle');
  const debugContent = document.getElementById('debug-content');
  const debugModeToggle = document.getElementById('debug-mode-toggle');
  const clearConsoleBtn = document.getElementById('clear-console');
  const showCookiesBtn = document.getElementById('show-cookies');

  // Debug settings
  let debugMode = true;
  let currentOrgSlug = '';
  let currentProjectSlug = '';
  let currentCookieHeader = '';
  
  // Store all members data for clipboard functionality
  let allTeamsData = [];
  
  // Selected permission filters (array to support multi-select)
  let selectedPermissions = [];
  
  // Add event listeners to input fields to trigger extract on Enter key
  orgSlugInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      extractBtn.click(); // Trigger the extract button click
      debugLog('Enter key pressed in org-slug input, triggering extract');
    }
  });
  
  projectSlugInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      extractBtn.click(); // Trigger the extract button click
      debugLog('Enter key pressed in project-slug input, triggering extract');
    }
  });
  
  // Debug logging function - moved up so it's available for all event handlers
  function debugLog(...args) {
    if (debugMode) {
      console.log('[DEBUG]', ...args);
    }
  }
  
  // Initialize debug UI
  debugToggle.addEventListener('click', function() {
    if (debugContent.style.display === 'block') {
      debugContent.style.display = 'none';
      debugToggle.textContent = '▶ Debug Options (click to expand)';
    } else {
      debugContent.style.display = 'block';
      debugToggle.textContent = '▼ Debug Options (click to collapse)';
    }
  });
  
  // Add event listener for Open Dashboard button
  openDashboardBtn.addEventListener('click', function() {
    try {
      // Open dashboard directly without using message passing
      const dashboardUrl = chrome.runtime.getURL("dashboard.html");
      chrome.tabs.create({ url: dashboardUrl });
      debugLog('Dashboard opened:', dashboardUrl);
    } catch (error) {
      console.error('Error opening dashboard:', error);
      debugLog('Error opening dashboard:', error);
    }
  });

  // Add event listeners for permission filters (multi-select)
  permissionFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      const permission = this.getAttribute('data-permission');
      
      // Toggle the active state of this filter
      this.classList.toggle('active');
      
      // Update selectedPermissions array
      if (this.classList.contains('active')) {
        // Add permission if not already in the array
        if (!selectedPermissions.includes(permission)) {
          selectedPermissions.push(permission);
        }
      } else {
        // Remove permission from the array
        selectedPermissions = selectedPermissions.filter(p => p !== permission);
      }
      
      // Apply filtering with the updated selected permissions
      applyPermissionFilter();
      
      debugLog('Filters applied:', selectedPermissions);
    });
  });
  
  // Add event listener for Select All button
  selectAllBtn.addEventListener('click', function() {
    permissionFilters.forEach(filter => {
      const permission = filter.getAttribute('data-permission');
      
      // Add active class to all filters
      filter.classList.add('active');
      
      // Add permission to selected list if not already there
      if (!selectedPermissions.includes(permission)) {
        selectedPermissions.push(permission);
      }
    });
    
    applyPermissionFilter();
    debugLog('All permissions selected:', selectedPermissions);
  });
  
  // Add event listener for Select None button
  selectNoneBtn.addEventListener('click', function() {
    permissionFilters.forEach(filter => {
      // Remove active class from all filters
      filter.classList.remove('active');
    });
    
    // Clear selected permissions
    selectedPermissions = [];
    
    applyPermissionFilter();
    debugLog('No permissions selected');
  });
  
  // Function to apply permission filtering
  function applyPermissionFilter() {
    const memberItems = document.querySelectorAll('.member-item');
    
    memberItems.forEach(item => {
      const memberPermission = item.getAttribute('data-permission').toLowerCase();
      
      if (selectedPermissions.length === 0) {
        // If no permissions are selected, show all members
        item.classList.remove('filtered');
      } else if (selectedPermissions.includes(memberPermission)) {
        // If the member's permission is in the selected list, show it
        item.classList.remove('filtered');
      } else {
        // Otherwise, hide it
        item.classList.add('filtered');
      }
    });
    
    // Check if we need to show "no results" messages for teams
    const teamSections = document.querySelectorAll('.team-section');
    teamSections.forEach(section => {
      const visibleMembers = section.querySelectorAll('.member-item:not(.filtered)');
      const noResultsMsg = section.querySelector('.no-results-after-filter');
      
      if (visibleMembers.length === 0) {
        // If no message exists, create one
        if (!noResultsMsg) {
          const msg = document.createElement('div');
          msg.className = 'no-results-after-filter';
          msg.textContent = getNoResultsMessage();
          msg.style.padding = '10px';
          msg.style.fontStyle = 'italic';
          msg.style.color = '#666';
          section.querySelector('.member-list').appendChild(msg);
        } else {
          noResultsMsg.style.display = 'block';
          noResultsMsg.textContent = getNoResultsMessage();
        }
      } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
      }

      // Update the team copy button text with the visible members count
      const teamCopyBtn = section.querySelector('.team-copy-btn');
      if (teamCopyBtn) {
        const count = visibleMembers.length;
        teamCopyBtn.textContent = `Copy ${count} Email${count !== 1 ? 's' : ''}`;
      }
    });

    // Update the global "Copy All Emails" button with total visible member count
    const copyAllBtn = document.getElementById('copy-all-emails');
    if (copyAllBtn) {
      const allVisibleMembers = document.querySelectorAll('.member-item:not(.filtered)');
      const totalCount = allVisibleMembers.length;
      copyAllBtn.textContent = `Copy All Emails (${totalCount})`;
    }
  }
  
  // Helper function to create the "no results" message with selected permissions
  function getNoResultsMessage() {
    if (selectedPermissions.length === 0) {
      return "No members found. Please select at least one permission to filter by.";
    } else if (selectedPermissions.length === 1) {
      return `No members with "${selectedPermissions[0]}" permission in this team.`;
    } else {
      // Format the list of permissions nicely
      const lastPermission = selectedPermissions[selectedPermissions.length - 1];
      const otherPermissions = selectedPermissions.slice(0, -1).join('", "');
      
      return `No members with "${otherPermissions}" or "${lastPermission}" permissions in this team.`;
    }
  }

  debugModeToggle.addEventListener('change', function() {
    debugMode = this.checked;
    debugLog('Debug mode ' + (debugMode ? 'enabled' : 'disabled'));
  });

  clearConsoleBtn.addEventListener('click', function() {
    console.clear();
    debugLog('Console cleared');
  });

  showCookiesBtn.addEventListener('click', async function() {
    const cookies = await getSentryCookies();
    debugLog('All Sentry cookies:', cookies);
    
    let html = '<h3>Sentry Cookies</h3><ul>';
    cookies.forEach(cookie => {
      html += `<li>${cookie.name} (Domain: ${cookie.domain})</li>`;
    });
    html += '</ul>';
    
    resultsDiv.innerHTML = html;
  });

  // Wrap event handlers with try/catch for Sentry reporting
  if (extractBtn) {
    extractBtn.addEventListener('click', function() {
      try {
        // Add breadcrumb for button click
        if (window.SentryHelpers) {
          window.SentryHelpers.addBreadcrumb('Extract button clicked', 'ui.click');
        }
        
        // Get input values
        const orgSlug = orgSlugInput.value.trim();
        const projectSlugsInput = projectSlugInput.value.trim();
        
        // Parse comma-separated project slugs
        const projectSlugs = projectSlugsInput.split(',').map(slug => slug.trim()).filter(slug => slug !== '');
        
        // Validate inputs
        if (!orgSlug || projectSlugs.length === 0) {
          showError('Please enter both organization and at least one project slug.');
          return;
        }
        
        // Continue with your existing logic for extraction
        // ... existing extraction logic ...
        
      } catch (error) {
        // Capture the error
        if (window.SentryHelpers) {
          window.SentryHelpers.captureException(error, {
            org_slug: orgSlugInput.value,
            project_slugs: projectSlugInput.value
          });
        }
        
        showError('An error occurred during extraction. Please try again.');
        console.error('Extraction error:', error);
      }
    });
  }

  // Wrap error handling function with Sentry reporting
  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      
      if (window.SentryHelpers) {
        window.SentryHelpers.captureMessage(message, 'error', {
          location: 'popup',
          function: 'showError'
        });
      }
    }
    
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }

  extractBtn.addEventListener('click', async function() {
    // Clear previous results and errors
    resultsDiv.innerHTML = '';
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    allTeamsData = [];
    
    const orgSlug = orgSlugInput.value.trim();
    let projectSlugsInput = projectSlugInput.value.trim();
    
    // Parse project slugs (split by comma and trim each)
    const projectSlugs = projectSlugsInput.split(',').map(slug => slug.trim()).filter(slug => slug !== '');
    
    // Store current org slug for debug functions
    currentOrgSlug = orgSlug;
    // Store all project slugs as comma-separated for debug functions
    currentProjectSlug = projectSlugs.join(',');
    
    if (!orgSlug || projectSlugs.length === 0) {
      showError('Please enter both organization and at least one project slug.');
      return;
    }
    
    try {
      loadingDiv.style.display = 'block';
      
      // Step 1: Get the session cookies
      const cookies = await getSentryCookies();
      debugLog('Cookies found:', cookies);
      
      if (!cookies || cookies.length === 0) {
        showError('Could not find Sentry session cookies. Please make sure you are logged in to Sentry as a superadmin.');
        return;
      }
      
      // Create cookie header string
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      currentCookieHeader = cookieHeader;
      debugLog('Cookie header created (length):', cookieHeader.length);
      
      // Step 2: For each project slug, get the associated teams
      debugLog(`Processing ${projectSlugs.length} project(s): ${projectSlugs.join(', ')}`);
      
      // Create a Map to store unique teams by their slug to avoid duplicates
      const teamsMap = new Map();
      const projectTeamsMap = new Map(); // Map to store teams per project
      
      // Fetch teams for each project
      for (const projectSlug of projectSlugs) {
        try {
          debugLog(`Fetching teams for project: ${orgSlug}/${projectSlug}`);
          const projectTeams = await getProjectTeams(orgSlug, projectSlug, cookieHeader);
          debugLog(`Found ${projectTeams.length} teams for project: ${projectSlug}`);
          
          // Store teams for this project
          projectTeamsMap.set(projectSlug, projectTeams);
          
          // Add each team to the unique teams map
          projectTeams.forEach(team => {
            if (!teamsMap.has(team.slug)) {
              teamsMap.set(team.slug, team);
            }
          });
        } catch (error) {
          debugLog(`Error fetching teams for project ${projectSlug}: ${error.message}`);
          // Continue with other projects instead of stopping on error
          continue;
        }
      }
      
      // Convert the Map to an array of unique teams
      const uniqueTeams = Array.from(teamsMap.values());
      debugLog(`Found ${uniqueTeams.length} unique teams across all projects`);
      
      if (uniqueTeams.length === 0) {
        showError(`No teams found for the specified project(s) in organization "${orgSlug}".`);
        return;
      }
      
      // Step 3: For each unique team, get the members
      debugLog(`Fetching members for ${uniqueTeams.length} unique teams...`);
      const teamMembersPromises = uniqueTeams.map(team => {
        debugLog(`Fetching members for team: ${team.slug}`);
        return getTeamMembers(orgSlug, team.slug, cookieHeader);
      });
      
      const teamMembersResults = await Promise.all(teamMembersPromises);
      debugLog('Team members results:', teamMembersResults);
      
      // Store the team data for clipboard functionality
      uniqueTeams.forEach((team, index) => {
        allTeamsData.push({
          team: team,
          members: teamMembersResults[index] || [],
          // Store which projects this team belongs to
          projects: Array.from(projectTeamsMap.entries())
            .filter(([_, teams]) => teams.some(t => t.slug === team.slug))
            .map(([project, _]) => project)
        });
      });
      
      // Step 4: Display the results
      displayResults(uniqueTeams, teamMembersResults, projectTeamsMap, projectSlugs);
      
    } catch (error) {
      showError(`Error: ${error.message}`);
      console.error(error);
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
  
  async function getSentryCookies() {
    return new Promise((resolve) => {
      chrome.cookies.getAll({
        domain: 'sentry.io'
      }, function(cookies) {
        debugLog('All cookies from sentry.io:', cookies.map(c => c.name));
        
        // Filter for authentication-related cookies
        // This includes common auth cookie names, but may need adjustment
        const authCookies = cookies.filter(cookie => 
          cookie.name.includes('session') || 
          cookie.name.includes('auth') || 
          cookie.name.includes('csrf') ||
          cookie.name.includes('token')
        );
        
        debugLog('Filtered auth cookies:', authCookies.map(c => c.name));
        resolve(authCookies);
      });
    });
  }
  
  async function getProjectTeams(orgSlug, projectSlug, cookieHeader) {
    const url = `https://sentry.io/api/0/projects/${orgSlug}/${projectSlug}/teams/`;
    debugLog('Fetching project teams from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      credentials: 'same-origin',
      mode: 'cors'
    });
    
    debugLog('Project teams response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Make sure you have superadmin privileges.');
      } else if (response.status === 404) {
        throw new Error(`Project "${projectSlug}" not found in organization "${orgSlug}".`);
      } else {
        throw new Error(`Failed to fetch project teams: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    debugLog('Project teams data:', data);
    return data;
  }
  
  async function getTeamMembers(orgSlug, teamSlug, cookieHeader) {
    // Always use the alternative endpoint since it's working
    const url = `https://sentry.io/api/0/teams/${orgSlug}/${teamSlug}/members/`;
    
    debugLog(`Fetching team members from URL:`, url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      credentials: 'same-origin',
      mode: 'cors'
    });
    
    debugLog(`Team members response status:`, response.status);
    
    if (!response.ok) {
      try {
        const errorText = await response.text();
        debugLog('Error response text:', errorText);
        console.error(`Failed to fetch members for team ${teamSlug}: ${response.status} ${response.statusText}`);
        return []; // Return empty array instead of throwing to continue with other teams
      } catch (e) {
        debugLog('Could not get error response text');
        return [];
      }
    }
    
    const members = await response.json();
    debugLog(`Team ${teamSlug} members:`, members);
    
    // Sort members by role/permissions
    return members.sort((a, b) => {
      // This sorting logic might need adjustment based on Sentry's actual data structure
      const roleOrder = {
        'owner': 1,
        'admin': 2,
        'manager': 3,
        'member': 4
      };
      
      const roleA = a.role || 'member';
      const roleB = b.role || 'member';
      
      return roleOrder[roleA] - roleOrder[roleB];
    });
  }
  
  function copyAllEmailsToClipboard() {
    if (!allTeamsData || allTeamsData.length === 0) {
      showError('No data to copy. Please extract team members first.');
      return;
    }
    
    // Extract unique emails from all teams, respecting filters (visible members only)
    const allEmails = new Set();
    
    allTeamsData.forEach(teamData => {
      teamData.members.forEach(member => {
        // Get member's role/permission
        let role = (member.role || (member.user && member.user.role) || '').toLowerCase();
        if (!role) role = 'member'; // Default to member if no role specified
        
        // Check if the member should be visible based on current filters
        const isVisible = selectedPermissions.length === 0 || selectedPermissions.includes(role);
        
        if (isVisible) {
          const email = member.email || (member.user && member.user.email);
          if (email) {
            allEmails.add(email);
          }
        }
      });
    });
    
    const clipboardText = Array.from(allEmails).join('\n');
    
    if (clipboardText) {
      navigator.clipboard.writeText(clipboardText)
        .then(() => {
          showCopySuccess(
            `Copied ${allEmails.size} email${allEmails.size !== 1 ? 's' : ''}${getFilterTextForCopy()} from all teams`
          );
        })
        .catch(err => {
          showError(`Failed to copy to clipboard: ${err.message}`);
        });
    } else {
      if (selectedPermissions.length > 0) {
        showError(`No emails found matching the selected permissions.`);
      } else {
        showError('No emails found to copy.');
      }
    }
  }
  
  function copyTeamEmailsToClipboard(teamIndex) {
    if (!allTeamsData || !allTeamsData[teamIndex]) {
      showError('Team data not found.');
      return;
    }
    
    const teamData = allTeamsData[teamIndex];
    const teamName = teamData.team.name || teamData.team.slug;
    
    // Extract emails from this specific team, respecting filters (visible members only)
    const teamEmails = new Set();
    
    teamData.members.forEach(member => {
      // Get member's role/permission
      let role = (member.role || (member.user && member.user.role) || '').toLowerCase();
      if (!role) role = 'member'; // Default to member if no role specified
      
      // Check if the member should be visible based on current filters
      const isVisible = selectedPermissions.length === 0 || selectedPermissions.includes(role);
      
      if (isVisible) {
        const email = member.email || (member.user && member.user.email);
        if (email) {
          teamEmails.add(email);
        }
      }
    });
    
    const clipboardText = Array.from(teamEmails).join('\n');
    
    if (clipboardText) {
      navigator.clipboard.writeText(clipboardText)
        .then(() => {
          showCopySuccess(
            `Copied ${teamEmails.size} email${teamEmails.size !== 1 ? 's' : ''}${getFilterTextForCopy()} from team "${teamName}"`
          );
        })
        .catch(err => {
          showError(`Failed to copy to clipboard: ${err.message}`);
        });
    } else {
      if (selectedPermissions.length > 0) {
        showError(`No emails found matching the selected permissions in team "${teamName}".`);
      } else {
        showError(`No emails found in team "${teamName}".`);
      }
    }
  }
  
  // Helper function to format the filter text for copy messages
  function getFilterTextForCopy() {
    if (selectedPermissions.length === 0) {
      return '';
    } else if (selectedPermissions.length === 1) {
      return ` with "${selectedPermissions[0]}" permission`;
    } else {
      // Format the permissions nicely
      const lastPermission = selectedPermissions[selectedPermissions.length - 1];
      const otherPermissions = selectedPermissions.slice(0, -1).join('", "');
      
      return ` with "${otherPermissions}" or "${lastPermission}" permissions`;
    }
  }
  
  function showCopySuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'copy-success';
    successDiv.textContent = message;
    
    // Add the success message to the page
    resultsDiv.insertAdjacentElement('afterbegin', successDiv);
    
    // Remove the success message after 3 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }
  
  // Helper function to get the total count of members across all teams
  function getTotalMemberCount(teamMembersResults) {
    let total = 0;
    for (const members of teamMembersResults) {
      if (members && Array.isArray(members)) {
        total += members.length;
      }
    }
    return total;
  }
  
  function toggleTeamsVisibility() {
    const teamSections = document.querySelectorAll('.team-section');
    const toggleButton = document.getElementById('toggle-teams-btn');
    
    let isHidden = toggleButton.getAttribute('data-hidden') === 'true';
    isHidden = !isHidden; // Toggle the state
    
    teamSections.forEach(section => {
      section.style.display = isHidden ? 'none' : 'block';
    });
    
    toggleButton.setAttribute('data-hidden', isHidden.toString());
    toggleButton.textContent = isHidden ? 'Show All Teams' : 'Hide Teams';
  }
  
  function displayResults(teams, teamMembersResults, projectTeamsMap, projectSlugs) {
    if (teams.length === 0) {
      resultsDiv.innerHTML = '<p>No teams found for these projects.</p>';
      return;
    }
    
    // Reset filter section and make it visible
    filterSection.style.display = 'block';
    selectedPermissions = []; // Reset selected permissions
    
    // Reset all filter buttons
    permissionFilters.forEach(filter => {
      filter.classList.remove('active');
    });
    
    let html = '';
    
    // Show project information header
    if (projectSlugs.length > 1) {
      html += `<h2>Team Members for ${projectSlugs.length} Projects</h2>`;
      html += `<div style="margin-bottom: 20px;">
        <p>Projects searched: ${projectSlugs.map(slug => `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; margin: 0 2px;">${slug}</span>`).join(', ')}</p>
      </div>`;
    } else {
      html += `<h2>Team Members for Project "${currentProjectSlug}"</h2>`;
    }
    
    // Add copy all emails button
    html += `
      <div class="copy-buttons">
        <button class="copy-btn" id="copy-all-emails">Copy All Emails (${getTotalMemberCount(teamMembersResults)})</button>
      </div>
    `;
    
    // Add a summary section if there are multiple teams
    if (teams.length > 1) {
      html += `
        <div class="summary-section">
          <p>Found ${teams.length} teams across ${projectSlugs.length} project${projectSlugs.length > 1 ? 's' : ''}</p>
          <button id="toggle-teams-btn" class="toggle-btn" data-hidden="false">Hide Teams</button>
        </div>
      `;
    }
    
    // Display each team and its members
    teams.forEach((team, index) => {
      const members = teamMembersResults[index];
      const memberCount = members ? members.length : 0;
      
      // Find which projects this team belongs to
      const teamProjects = Array.from(projectTeamsMap.entries())
        .filter(([_, teams]) => teams.some(t => t.slug === team.slug))
        .map(([project, _]) => project);
      
      html += `
        <div class="team-section">
          <div class="team-header">
            <div class="team-name">
              ${team.name || team.slug}
              ${teamProjects.length > 0 ? 
                `<div style="font-size: 12px; margin-top: 4px; font-weight: normal; color: #555;">
                  Projects: ${teamProjects.map(project => 
                    `<span style="background: #eef; padding: 1px 4px; border-radius: 2px; margin-right: 4px;">${project}</span>`
                  ).join('')}
                </div>` : ''
              }
            </div>
            <button class="team-copy-btn" data-team-index="${index}">Copy ${memberCount} Email${memberCount !== 1 ? 's' : ''}</button>
          </div>
          <div class="member-list">
      `;
      
      if (!members || members.length === 0) {
        html += '<p>No members in this team.</p>';
      } else {
        members.forEach(member => {
          // Log the raw member data to help debug
          debugLog('Raw member data:', member);
          
          // Handle different possible member data structures
          const email = member.email || (member.user && member.user.email) || '';
          const name = member.name || (member.user && member.user.name) || 'Unknown User';
          
          // Normalize role/permission value for filtering
          let role = (member.role || (member.user && member.user.role) || '').toLowerCase();
          
          // If role is empty, default to "member"
          if (!role) role = 'member';
          
          html += `
            <div class="member-item" data-permission="${role}">
              <strong>${name}</strong>
              ${email ? ` (${email})` : ''}
              ${role ? ` - <span class="member-role">${role}</span>` : ''}
            </div>
          `;
        });
      }
      
      html += `
          </div>
        </div>
      `;
    });
    
    // Add a debug section if in debug mode
    if (debugMode) {
      html += `
        <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
          <h3>Debug Information</h3>
          <p>Projects: ${projectSlugs.length}</p>
          <p>Unique teams found: ${teams.length}</p>
          <p>Check the browser console (F12) for detailed logs</p>
        </div>
      `;
    }
    
    resultsDiv.innerHTML = html;
    
    // Add event listener to copy all emails button
    document.getElementById('copy-all-emails').addEventListener('click', copyAllEmailsToClipboard);
    
    // Add event listeners to team copy buttons
    document.querySelectorAll('.team-copy-btn').forEach(button => {
      button.addEventListener('click', function() {
        const teamIndex = parseInt(this.getAttribute('data-team-index'), 10);
        copyTeamEmailsToClipboard(teamIndex);
      });
    });
    
    // Add event listener to toggle button if it exists
    const toggleBtn = document.getElementById('toggle-teams-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTeamsVisibility);
    }
  }
  
  // Add Sentry-wrapped functions for API calls
  function fetchWithErrorHandling(url, options) {
    return fetch(url, options).catch(error => {
      if (window.SentryHelpers) {
        window.SentryHelpers.captureException(error, {
          url,
          method: options?.method || 'GET'
        });
      }
      throw error;
    });
  }
}); 