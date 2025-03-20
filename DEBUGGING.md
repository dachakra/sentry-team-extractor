# Debugging Guide for Sentry Team Member Extractor

This document provides information for debugging common issues with the Sentry Team Member Extractor Chrome extension.

## Debug Mode

The extension includes a built-in debug mode that can be accessed by clicking the "Debug Options" toggle at the bottom of the popup. This provides several useful tools:

1. **Enable/Disable Debug Mode**: Toggle verbose logging in the console
2. **Clear Console**: Clear the browser console
3. **Show Cookies**: Display the current cookies for sentry.io

## Common Issues

### Authentication Issues

**Symptoms**: "Unauthorized" errors, empty results, or "Invalid JSON" errors.

**Possible Causes**:
- Not logged in to Sentry
- Session expired
- Not a superadmin

**Solutions**:
1. Ensure you are logged in to Sentry in the same browser
2. Try logging out and back in to refresh your session
3. Verify you have superadmin privileges

### Empty Results

**Symptoms**: "No teams found for this project" message.

**Possible Causes**:
- Incorrect organization or project slug
- Project doesn't exist
- Project doesn't have any teams assigned

**Solutions**:
1. Double-check the organization and project slugs
2. Verify the project exists in Sentry
3. Check if the project has teams assigned to it

### Permission Filtering

**Symptoms**: Not seeing results after applying permission filters.

**Possible Causes**:
- No team members with the selected permissions exist
- Multiple filters selected but no members have all those permissions

**Solutions**:
1. Try selecting different permission combinations
2. Use the "Select None" button to reset filters and show all members
3. Check the console for any error messages related to filtering

### Multiple Teams Support

**Symptoms**: Need to manage multiple teams for a project.

**Solution**:
The extension properly handles projects that belong to multiple teams. When a project has multiple teams, you'll see a toggle button to show/hide team sections for better organization. You can also copy all team members' emails with a single button click.

### Looker Dashboard Issues

**Symptoms**: Looker dashboard not loading, showing errors, or displaying a login screen.

**Possible Causes**:
- Not logged into Looker
- Missing permissions for the dashboard
- Content Security Policy (CSP) restrictions
- Network connectivity issues

**Solutions**:
1. Ensure you're logged into Looker in the same browser
2. Verify you have access to the specific dashboard being embedded
3. Check the browser console for any CSP-related errors
4. Ensure your network allows connections to the Looker domain

## Looker Dashboard

The extension includes a dedicated Looker Dashboard that can be accessed by clicking the "Open PPV Tools Dashboard" button in the popup. 

**Debugging Tips**:
- If the Looker dashboard isn't displaying correctly, check that you're logged into Looker
- Ensure you have the necessary permissions to view the dashboard
- For iframe loading issues, check the browser console for X-Frame-Options or CSP errors
- If the dashboard is slow to load, be patient as it may be processing a large amount of data
- If you see authentication errors, try opening Looker in another tab and logging in first

## Console Debugging

For advanced debugging, open the Chrome DevTools console:
1. Right-click on the extension popup and select "Inspect"
2. Navigate to the Console tab
3. Look for messages prefixed with `[DEBUG]` or `[BACKGROUND DEBUG]`

These messages provide detailed information about the extension's operations and any errors that occur.

## Reporting Issues

If you encounter issues that you cannot resolve using this guide, please report them with the following information:
1. Detailed description of the issue
2. Steps to reproduce
3. Console logs (with sensitive information redacted)
4. Chrome and extension version 