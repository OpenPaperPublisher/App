# Open Paper Matter (OPM)

### Overview

Static website publishing affords many advantages over dynamic sites for informational websites and blogs. Unfortunately, the authoring experience for static website tools tends to support software engineers without consideration for the user experience of the non-programmer author.

This project seeks to address the authoring experience of static website by creating a desktop application for managing the "front-matter" needed to make Dropbox’s “Paper” documents work as a document repository for a static website.

What is front-matter?

Front-matter is metadata about a blog post that supports organizating and sorting records, as well as additional features. So, the category or tag applied to a document would be an example of data typically stored in front-matter. The term front-matter comes from an approach where this information is placed at the beginning of a Markdown document.

### Architecture
1. Create Desktop App using https://tauri.studio/

1. User Create React App for as an application framework https://create-react-app.dev/

### Header
- Show Application Title “Open Paper Matter”
- Add Project (link)
- Select Project (menu)

### Homepage
- Welcome to this tools
- A placeholder for a description
- List of Paper documents for project (if selected)

### Add Project (Form)
   
Allows adding and editing project configuration information for an individual Paper Blog Project.

The form has the following fields:
- dropbox_auth_token: string
- dropbox_path: string

Submitting the form would write to a JSON file that is stored locally.

### Listing Paper Documents

Once a project is added, that project is selected by default. The settings are used to pull a list of files from a Dropbox folder, presented in reverse chronological order. Each document is a link. Clicking the link displays a form.

### Edit Paper Document Metadata

The data would be pre-populated with metadata for the document from the DropBox API.

The form has the following fields:

- tags: a comma separated list of values
- category: a string
- permalink: a string
- description: a string
- date: a date string in the format YYYY-MM-DD
- author: a string
- social graph image : a string for a URL
- template: string, default to “default”

Saving the form write the metadata back to the document via the DropBox API.

