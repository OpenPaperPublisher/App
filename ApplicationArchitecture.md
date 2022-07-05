# Overview of Project Structure and Architecture
This markdown file will contain a breakdown of the overarching project structure for both use in the development and maintainence of said structure and for reference after completion of the project.


## Project Wrapper: Tauri
For simplicity's purposes, and for the convenience of Tauri's initialization tools, the entire project is created with tauri's `npm create tauri-app` command.
This is for multiple reasons:
*   Abstractly, it makes most sense to initialize the software using the tool that enables a desktop app to exist
*   Tauri+Vite+React require a specific file structure that is handled automatically (through both tauri and vite build tools)
*   Tauri's initialization tools have everything it, Vite, and React (the latter 2 discussed later) need to get up and running as well
*   All other dependencies can be easily installed over this

## Project Build Tool: Vite
While Vite and Create React App (or CRA's Webpack under the hood) have very similar use cases for quickly building projects utilizing React js/ts, Vite offers slight advantages specifically in the desktop application over CRA's convenience and widespread use:
*   Vite has a more succinct file structure for application development over web development with React; CRA's `public` folder is a requirement for the build to run, however serves no purpose in desktop development as all files are local and "public", unlike server-served webpages.
*   Vite has imrpoved intialization speed, build speed, and project size, allowing for development to move slightly quicker and reduce total application size in both development and production settings.

## Project Framework: Tauri+Vite+React
Using a combination of Tauri's delivery of webview-based React applications, the project is able to leverage the many advantages of web-based applications to allow for ease of development and use.
Tauri's approach to packing web-based applications and Vite's smaller footprint compared to other build solutions also means the application can have a much smaller filesize than other applications while still offering the same experience and tools.

### Dropbox API
The application also heavily utlizes Dropbox's javascript API implementation to query dropbox for requests. This requires authentication as outlined in the `AuthenticationArchitecture.md` file.
