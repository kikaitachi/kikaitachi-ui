# kikaitachi-ui

Web interface to control robots

## Usage

Latest version from `main` branch is always available at [http://ui.kikaitachi.com](http://ui.kikaitachi.com).
Please note that `http` protocol is used instead of `https`. If you use `https` protocol then your robot must also serve WebSocket via `https`.

To run locally, for example, for offline applications you just need to serve [/docs](/docs) folder using any web server.
This repository includes minimal web server which can be started with [Node.js](https://nodejs.org/) (tested with version 12.14.1):
```
cd docs
node server.js
```
In this case application will be available at [http://localhost:8080/](http://localhost:8080/).
