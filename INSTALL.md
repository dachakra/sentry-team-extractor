# Sentry Team Member Extractor - Installation Guide

This guide will help you install the Sentry Team Member Extractor extension locally in your Chrome browser.

## Prerequisites

- Google Chrome browser (or any Chromium-based browser like Edge, Brave, etc.)
- Superadmin access to Sentry (for the extension to work properly)

## Installation Steps

1. **Extract the zip file**
   - Save the `sentry-team-extractor-extension.zip` file to your computer
   - Extract/unzip the contents to a folder on your computer
   - Keep this folder in a location where you won't accidentally delete it

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" by toggling the switch in the top-right corner
   - Click the "Load unpacked" button
   - Select the folder where you extracted the zip file
   - The extension should now appear in your list of installed extensions

3. **Pin the extension (optional)**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find the Sentry Team Member Extractor extension
   - Click the pin icon to keep it visible in your toolbar

## Usage

1. **Using the Popup**
   - Click on the extension icon in your Chrome toolbar
   - Enter the organization slug (e.g., "sentry")
   - Enter the project slug (e.g., "backend")
   - Click "Extract Team Members"
   - The extension will fetch and display all team members associated with the project

2. **Using the Dashboard**
   - Click on the extension icon in your Chrome toolbar
   - Click "Open PPV Tools Dashboard" to open the dashboard in a new tab
   - In the dashboard, you can:
     - Use the Email Extractor tab to extract team members
     - Use the Looker Dashboard tab to view embedded Looker analytics

## Requirements

- You must be logged into Sentry in the same browser
- You need superadmin privileges on Sentry for the extension to work properly

## Troubleshooting

If you encounter any issues:
- Check that you're logged into Sentry
- Make sure you have the correct permissions
- Verify that you entered the correct organization and project slugs
- Check the browser console (F12 > Console tab) for any error messages

For more detailed troubleshooting, refer to the DEBUGGING.md file included in the package. 