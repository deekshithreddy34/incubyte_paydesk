# 12 — Deployment, documentation and demo
Prerequisite: 11. This is an execution checklist, not a claim that deployment has happened.

## Steps
1. Choose a host supporting a Node process and persistent managed PostgreSQL. Check actual provider/runtime requirements and pg_trgm support before configuring. Do not promise free hosting without checking.
2. Build React assets and serve them from Express after /api routes. Unknown /api routes must return JSON 404 rather than the SPA. Configure client-route fallback using syntax supported by the installed Express major.
3. Configure DATABASE_URL as a server secret, PORT from environment, production mode and TLS/database SSL as required. Never place secrets in Vite variables.
4. Run committed migrations with the deployment migration command (not development migrate or db push). Generate Prisma client at the appropriate build stage.
5. Seed the designated demo database once with explicit operator action. Never reset salary data on restart or automatically run destructive seeding on every deploy.
6. Verify health, assets, refresh/deep links, all seven product endpoints and both write workflows on deployed software.
7. Clearly label synthetic data. No real salary records until authentication/authorization and production controls are implemented. Preserve intended site access settings.
8. Complete README with prerequisites, actual versions, setup commands, env example, migrations, seed/reset behaviour, tests, architecture, money/rate assumptions, limitations, deployed URL.
9. Include one-page requirements, diagram, design decisions, AI usage examples, tests/performance report and future roadmap in docs/.
10. Record an actual 3–5 minute screen demo: directory/filter/page → add employee → salary change/history → USD group insights/outliers → brief tests and design explanation. Save/link the real recording; do not claim a video exists if it does not.
11. Review git history for genuine incremental progression, remove secrets, ensure repository visibility/access works for reviewers, and prepare repository + deployment + video links. The user will reply to the assessment email; do not send it automatically.

## Files
Deployment configuration appropriate to selected provider; README.md; docs/demo-script.md; docs/ai-usage.md; docs/decisions.md; docs/testing.md; docs/performance.md; docs/future-scope.md.

## Acceptance
Fresh clone instructions work. Actual deployed application and video links are verified. Tests/build pass for the committed version. No credentials committed and no invented test results.
Commit: docs: finalize deployment demo and assessment handoff.

