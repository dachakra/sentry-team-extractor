# Sentry Team Member Extractor

A Chrome extension for Sentry superadmins to extract team members from specific projects and copy their emails to the clipboard.

## Features

- Extract team members from a specific Sentry project
- Display team members sorted by permissions (admin, member, owner)
- Filter team members by permission types (Billing, Member, Admin, Manager, Owner)
- Select multiple permission types to view combinations of team members
- Handle projects belonging to multiple teams with a toggle to show/hide
- Copy all team members' emails to the clipboard with one click
- Simple UI with organization and project slug inputs
- Uses superadmin privileges to access team data
- Integrated Looker Dashboard accessible with a single click

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and visible in your Chrome toolbar

## Usage

### Using the Team Member Extractor

1. Click on the extension icon in your Chrome toolbar
2. Enter the organization slug (e.g., "sentry")
3. Enter the project slug (e.g., "backend")
4. Click "Extract Team Members"
5. The extension will fetch and display all team members associated with the project
6. Use the permission filters to show only team members with specific permissions
   - Click on multiple permissions to select combinations (e.g., both Admin AND Owner)
   - Use "Select All" or "Select None" for quick filtering
7. Use the "Copy All Emails to Clipboard" button to copy emails (respects your current filters)
8. Toggle team visibility using the "Hide/Show All Teams" button if the project belongs to multiple teams

### Using the Looker Dashboard

1. Click on the extension icon in your Chrome toolbar
2. Click "Open PPV Tools Dashboard" to open the Looker Dashboard in a new tab
3. The dashboard provides:
   - Real-time analytics from Looker
   - Interactive data visualizations and metrics
   - Direct integration with Looker's servers for up-to-date information

## Requirements

- Chrome browser
- Superadmin privileges on Sentry
- Must be logged into Sentry in the same browser
- For the Looker Dashboard, you need appropriate access permissions to the Looker instance

## Troubleshooting

- If you encounter errors, check the console for debug information
- Ensure you are logged into Sentry with superadmin privileges
- Verify that the organization and project slugs are correct
- If you're having issues with multiple teams, try using the toggle button to show/hide teams
- For Looker Dashboard issues, ensure you have proper access to the embedded dashboard URL

## Privacy

This extension processes all data locally in your browser. No data is sent to any external servers other than the official Sentry API endpoints and Looker for the embedded dashboard. Your credentials and the extracted data remain within your browser.

## Development

To modify or extend this extension:

1. Clone the repository
2. Make your changes to the code
3. Test the extension locally by loading it as an unpacked extension
4. Submit a pull request with your changes

## License

This project is licensed under the MIT License - see the LICENSE file for details. 