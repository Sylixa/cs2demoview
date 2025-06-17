# CS2 2D Viewer

This project provides a standalone 2D viewer for Counter-Strike 2 (CS2) demos.

## Project Motivation

This viewer was developed to offer an alternative to existing online CS2 demo platforms that often require user accounts, limit usage, or gate features behind subscriptions. My goal was to create a tool that's easy to get and use for checking out CS2 matches in 2D, without needing to sign up or pay anything.

## Core Components & Acknowledgements

This project utilizes open-source code and data from the following projects, and I am grateful to their creators for making these resources publicly available:

-   **Map Data:**

    -   **boltobserv** by `boltgolt`
    -   [GitHub Repository](https://github.com/boltgolt/boltobserv)
    -   This project incorporates map data derived from `boltobserv` to render the 2D environments.

-   **Demo Parsing:**
    -   **demoparser** by `LaihoE`
    -   [GitHub Repository](https://github.com/LaihoE/demoparser)
    -   The robust demo parsing capabilities are based on the code from `demoparser`, enabling the extraction of game events and player movements from CS2 demo files.

Their work has been essential in enabling the creation of this tool. Thanks :3

## Live Demo

Live Demo on Github(You need to provide your own demo): [sylixa.github.io/cs2demoview](https://sylixa.github.io/cs2demoview/)

## TODO

### ✨ Planned Features

-   [ ] Grenade support
-   [ ] Player item overview
-   [ ] Maybe custom color?

### 🚀 Performance & Optimizations

-   [ ] Use worker for when preparing the parsed data to be render
-   [ ] Maybe group event together to improve parsing speed

### 📈 Improvements & Refinements

-   [ ] Round seeker instead of just a slider
-   [ ] Hide debug UI away
-   [ ] Render player HP
-   [ ] Improve UI/UX in general
-   [ ] Grenade might need lerp

### 🐞 Bug Fixes / Known Issues

-   [ ] Incorrect team when using WASM, unsure how to fix it

---
