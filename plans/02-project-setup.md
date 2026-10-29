# 02 — JavaScript setup and dependencies
Prerequisite: 01. Goal: reproducible development and test foundation.

## Steps
1. Create private npm workspaces client and server. Set type: module in both. Use React/Vite's JavaScript template, never react-ts. Add .gitignore for node_modules, .env, build output, test artifacts and coverage; commit .env.example only.
2. Select a supported Node runtime compatible with the actual package versions. Pin it in .nvmrc, engines, CI and deployment. Resolve current compatible package versions from official docs; commit the lockfile. Do not mix Prisma CLI/client/adapter versions.
3. Install packages below in the correct workspace. Only import packages used by that layer.
4. Create server/src/app.js (exports Express app; no listen), server/src/server.js (listen, graceful shutdown), server/src/config/env.js (validated config), and server/src/db/prisma.js (one client).
5. Create Vite React entry, basic navigation and a placeholder page. Development Vite proxy sends /api to Express. Production will serve built React from Express for a simple same-origin deployment.
6. Add local PostgreSQL via compose.yaml, with persistent volume and separate development/test databases. Do not commit credentials used in hosting.
7. Add scripts and a smoke test proving the test runner works without launching a listening server.

## Packages
| Workspace | Runtime | Development |
|---|---|---|
| server | express, zod, dotenv, helmet, @prisma/client, decimal.js | prisma, tsx (runs JS seed scripts if required by selected Prisma setup), vitest, supertest |
| client | react, react-dom, react-router-dom, @tanstack/react-query, @mui/material, @emotion/react, @emotion/styled, decimal.js | vite, @vitejs/plugin-react, vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, msw |
| root | none | concurrently, eslint, @eslint/js, globals, eslint-plugin-react-hooks, eslint-plugin-react-refresh, prettier, @playwright/test, @vitest/coverage-v8 |

If the chosen Prisma major requires a PostgreSQL driver adapter, install its matching @prisma/adapter-pg and pg and configure the client accordingly. Do not add an adapter to older configuration without checking compatibility. Prefer native node --watch for JS backend dev if supported. No unnecessary TS types packages or tsconfig files.

## Required scripts
Root: dev, build, lint, test:unit, test:integration, test:e2e, test:coverage.
Server: dev, start, test:unit, test:integration, db:generate, db:migrate, db:deploy, db:seed.
Client: dev, build, preview, test.
Map scripts to installed tools; npm ci from root must reproduce installation.

## Environment
DATABASE_URL, TEST_DATABASE_URL, PORT, NODE_ENV. Use the same-origin /api path in the client. Browser environment must never contain database URLs or secrets.

## Files
package.json, package-lock.json, .nvmrc, .gitignore, compose.yaml, eslint.config.js, client/package.json, client/vite.config.js, client/src/main.jsx, client/src/App.jsx, server/package.json, server/.env.example, server/src/app.js, server/src/server.js, server/src/config/env.js, server/src/db/prisma.js.

## Tests and acceptance
Fresh install, both dev processes, unit smoke test and React build succeed. Importing app.js does not open a port. Missing DATABASE_URL causes a clear startup failure. No .ts/.tsx application or config files.
Commit: chore: scaffold JavaScript client server and test tooling.

