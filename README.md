# ACME Salary Management

A web application for HR managers to manage salary records for 10,000 employees across countries and understand pay distribution.

## Live application

- **[Open Paydesk — Frontend](https://acmecorp-paydesk-4fxxc7445-deekshithreddy34s-projects.vercel.app/)**
- **[Backend API](https://incubyte-paydesk.onrender.com/)**
- [API health check](https://incubyte-paydesk.onrender.com/api/health)

## Start here: requirements

**[Read the one-page requirements document →](docs/requirements.md)**

The assessment requirements document is maintained in `docs/requirements.md`. It outlines the goal, scope, features, assumptions, and deliberately excluded functionality with the reasoning behind those choices.

## Features

- Search employees by name, email, or employee code.
- Filter by country, department, and level, with paginated results.
- Add employees and update annual gross salaries.
- View salary history, including the initial salary.
- Compare average, minimum, and maximum salaries across groups.
- Identify pay outliers using the 1.5×IQR rule.
- Populate the database with 10,000 synthetic employees using the seed script.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Testing | Vitest + Supertest |

## Key decisions

Salaries are stored as integer minor units to preserve precision. Salary updates and history entries are saved in one transaction. Insights use fixed illustrative exchange rates to compare salaries in USD.

## Assessment scope

This version focuses on salary records and insights. Payroll processing, taxes, payments, approvals, and live exchange rates are excluded because they introduce separate workflows. Authentication and role management are also outside this version; use synthetic data only.

See [requirements](docs/requirements.md) for the complete scope and exclusions, and [project documentation](docs/) for supporting details.
