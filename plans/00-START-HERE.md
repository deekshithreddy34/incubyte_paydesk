# ACME salary management — ordered implementation plans

## Instructions for the coding model
Build the assessment from the supplied salary management diagram using JavaScript only: React JSX, Express ES modules, PostgreSQL and Prisma. These are implementation instructions, not a completed application.

Read this file and 01 first. Follow 02–12 in numerical order. 13 describes future work and MUST NOT be implemented in version one. Consult 14 throughout. Each numbered file contains multiple ordered steps. Complete the tests and acceptance checklist of a step before advancing. Tests belong alongside each feature, not only at the end.

Use one repository with client/ and server/ packages and one root package-lock.json (npm workspaces). No TypeScript, microservices, Redis, queues, Elasticsearch, or generic repository framework. Routes → controllers → services → repositories inside one Express process. Browser never accesses the database directly.

Before making changes, inspect the actual repository and any AGENTS.md. Preserve existing work. Verify compatible package versions against official documentation, install them, and commit the lockfile. Do not copy unverified version-specific configuration. Use JavaScript configuration files.

## Order
1. 01: requirements and frozen decisions
2. 02: setup, dependencies and scripts
3. 03: database and migrations
4. 04: deterministic seed data
5. 05: API foundation and money contracts
6. 06: employee APIs
7. 07: salary and history APIs
8. 08: SQL pay insights and outliers
9. 09: React foundation and employee screens
10. 10: salary and insights screens
11. 11: integrated tests, performance and CI
12. 12: deployment and assessment handoff
13. 13: future roadmap only
14. 14: requirement-to-test traceability reference

## Working method
For each behaviour: write a meaningful failing test, implement the smallest correct solution, refactor, run relevant checks, then make a genuine incremental commit. Never fabricate historical commits or claim unrun tests passed. Suggested commit messages appear in each file; adapt them to actual changes.

At the end of each plan, report changed files, commands executed, results, and remaining limitations. Maintain docs/progress.md with completed checkboxes and blockers so another model can resume. Record material AI prompts, corrections and decisions in docs/ai-usage.md without secrets. Do not implement deferred features to make the project appear larger.

## Completion gate
All four core workflows work with the real API and database; 10,000 employees are reproducible; salary changes are atomic; monetary comparisons are exact until final rounding; meaningful automated tests pass; a deployed demo and actual video exist; requirements, decisions, setup and AI usage are committed.

## Model handoff prompt
“Read plans/00-START-HERE.md, plans/01-requirements.md and docs/progress.md. Implement the next unfinished numbered plan in JavaScript. Follow its tests, acceptance criteria and scope. Keep incremental commits. Do not implement plan 13 unless explicitly requested. Report actual checks and results before advancing.”

