## Overview
Tegro Pay Extension allows users to create payment invoices using the API from [Tegro.money](https://tegro.money/). This extension is designed to streamline the process of generating and managing payment requests directly from your browser.

## Architecture

### manifest.json
- **Configuration**: This file contains the extension's configuration settings.
- **Manifest Version**: Uses manifest version 3.
- **Permissions**:
  - `storage`: Permission to use local storage for storing local data.
  - Network requests permission for [Tegro Pay API](https://tegro.money/docs/).

### Icons
- **Location**: Icons for the extension are stored in the icon folder.

### Background Scripts
- **File**: `background_scripts/background.js`
- **Purpose**: A background script of the extension, essential for opening a page when clicking on the extension icon.

### Panels Folder
- Contains styles, scripts, and HTML markup for the main page of the extension.

## Scripts

### md5.min.js
- **Description**: A JavaScript library for MD5 data encryption.

### sha256.min.js
- **Description**: A JavaScript library for SHA256 data encryption.

### script.js
- **Main Logic**: The core functionality of the extension is defined here.
  - **auth() Function**: Handles authorization using Public KEY and API KEY, along with the validation of authorization fields.
  - **createPay() Function**: Responsible for forming payment data before sending, including encryption.
  - **createElement() Function**: Creates and sends a payment form.
  - **showError() Function**: Displays errors under the data entry fields.
  - **addLists() Function**: Adds and saves payment invoice parameters after generation.
  - **removeList() Function**: Removes an invoice from the payment list.
  - **renderList() Function**: Displays a list of saved invoices.

## Conclusion
The Tegro Pay Extension is a comprehensive tool for managing payment invoices efficiently. Its well-structured architecture and robust scripting ensure a seamless user experience for generating and handling payment requests.
