# Jupyter Metadata Helper for VS Code

![Made for VS Code](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)

A simple, powerful extension to standardize and automate metadata headers in your Jupyter Notebooks (`.ipynb` files). Perfect for bloggers, researchers, and anyone who needs consistent metadata for content management systems like Pelican, Nikola, or personal documentation.

This extension was created to solve two common problems:
1.  The repetitive task of adding a metadata header to every new notebook.
2.  Forgetting to update the `Last Modified` timestamp before finalizing a document.

## Features

*   **One-Command Notebook Creation**: Use a single command to create a new `.ipynb` file complete with a predefined metadata header in a raw cell.
*   **Automatic Timestamps**: The `Date` and `Last Modified` fields are automatically populated with the current date and time upon creation.
*   **Effortless 'Last Modified' Updates**: The `Last Modified` timestamp is **automatically updated to the current time every time you save the file**. No manual intervention required!
*   **Fully Customizable**: The metadata template is located in a single function within the extension, making it easy for you to change the fields, author name, or default values.

## Demo

 
*(**Note**: You would replace the URL above if you create a screen recording/GIF of the extension in action. For now, this text describes the functionality.)*

The process is simple:
1.  Run the command `Jupyter: Create New Notebook with Metadata Header`.
2.  A new notebook appears with the header.
3.  Work on your notebook.
4.  Press `Ctrl+S` to save. The `Last Modified` field updates instantly.

## Usage

### 1. Creating a New Notebook

1.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
2.  Type or select **`Jupyter: Create New Notebook with Metadata Header`**.
3.  A new, unsaved notebook will open with the following structure:

    ```
    [RAW CELL]
    Title: Your Title Here
    Date: 2025-09-09 10:20
    Last Modified: 2025-09-09 10:20
    Category: Core Python
    Tags: python
    Slug: your-slug-here
    Author: Abhijeet Adarsh
    Summary: Your Summary Here

    [CODE CELL]
    # Start your code here
    ```

### 2. Automatic Timestamp Update

Simply save your notebook (`Ctrl+S` or `Cmd+S`). The extension will automatically find the `Last Modified:` line in the first raw cell and update its value to the current time.

## Installation

Since this is a personal extension not published on the VS Code Marketplace, you need to install it from the packaged file (`.vsix`).

### Prerequisites

1.  **Node.js and npm**: Required to build the extension. [Download here](https://nodejs.org/).
2.  **vsce**: The official tool for packaging VS Code extensions. Install it globally via terminal:
    ```bash
    npm install -g vsce
    ```

### Steps

1.  **Clone or Download the Project**: Get the source code onto your local machine.
2.  **Install Dependencies**: Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```
3.  **Compile the Code**:
    ```bash
    npm run compile
    ```
4.  **Package the Extension**: This creates the installable file.
    ```bash
    vsce package
    ```
    This will generate a file named `jupyter-metadata-helper-0.0.1.vsix` (the version may vary).
5.  **Install in VS Code**:
    *   Open VS Code.
    *   Go to the **Extensions** view (`Ctrl+Shift+X`).
    *   Click the **three dots (...)** menu in the top-right corner.
    *   Select **"Install from VSIX..."**.
    *   Choose the `.vsix` file you just created.
    *   Reload VS Code when prompted.

The extension is now permanently installed!

## Customization

Want to change the author name or add a new field? The template is hard-coded for simplicity, making it easy to modify.

1.  Open the project in VS Code.
2.  Navigate to `src/extension.ts`.
3.  Find the `getMetadataContent` function.
4.  Edit the template string to match your needs:

    ```typescript
    // Inside src/extension.ts

    function getMetadataContent(isNew: boolean): string {
        const creationDate = getCurrentTimestamp();
        const lastModified = creationDate;

        // EDIT THE TEXT BLOCK BELOW
        return `Title: Your Title Here
    Date: ${creationDate}
    Last Modified: ${lastModified}
    Category: Your Default Category
    Tags: your, default, tags
    Slug: your-slug-here
    Author: Your Name Here
    Summary: Your Summary Here
    Status: draft`; // Example: Added a new 'Status' field
    }
    ```
5.  After making changes, re-compile and re-package the extension using `npm run compile` and `vsce package`, then install the new `.vsix` file.

## Release Notes

### 0.0.1

*   Initial release.
*   Command to create a new Jupyter Notebook with a metadata header.
*   Automatic update of `Last Modified` timestamp on file save.

---
## License

MIT License

Copyright (c) 2023 Abhijeet Adarsh

Permission is hereby granted... *(You can include the full MIT license text here if you wish)*.