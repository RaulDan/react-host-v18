# React 18 Module Federation host

```sh
npm ci
npm start
```

Open `http://localhost:3001/`. `npm run start-react-v18-host` remains an alias.
The dashboard loads all three apps; `/books`, `/goals`, and `/todos` display
individual remotes. The Angular host can run concurrently at port 4201.

## Start the remotes

Run `npm ci`, `npm run serve:federation`, and (in a separate terminal)
`npm run start:mock-server` in each remote project.

| Remote | Federation entry | API |
| --- | --- | --- |
| book-library-angular | http://localhost:4200/remoteEntry.js | http://localhost:7002 |
| goals-tracker | http://localhost:5000/remoteEntry.js | http://localhost:7001 |
| to-do-list-react | http://localhost:3000/remoteEntry.js | http://localhost:7000 |

Standalone development and federation serving use the same remote ports; stop
the standalone server before starting federation serving. Existing standalone
builds/commands remain available.

## Configuration and lifecycle

Edit `public/federation.remotes.json` to change remote deployment URLs. Reload
after configuration changes or a failed load. Each panel loads `./mount` through
the enhanced runtime, displays loading/errors independently, and disposes its
application when navigating away. Cancelled/late mounts and StrictMode effect
replay own separate targets and cannot clear a newer activation.

This host uses React 18.3.1; to-do retains its own React 19 runtime. Angular and
Svelte remotes also own their runtimes and Shadow DOM styles. The React Compiler
Babel setup was removed to avoid targeting React 19 from a React 18 host.
There is no web-component copying/prebuild prerequisite.

## Build and deploy

```sh
npm run build
npm run lint
npm run preview
```

Publish `dist`, configure its `federation.remotes.json`, and provide `index.html`
fallback for direct-route refreshes. Publish remote federation entries and every
associated chunk independently, with CORS allowing both host origins. Use HTTPS
remote entries for an HTTPS host. Host builds do not require sibling artifacts.
