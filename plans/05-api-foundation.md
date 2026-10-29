# 05 — API foundation and money contracts
Prerequisite: 04. Read before implementing any feature route.

## Steps
1. Add JSON body size limit, helmet, request validation, API 404 and centralized error middleware. Do not log full request bodies or database connection strings.
2. Define strict Zod schemas: reject unknown body fields, floats, numeric strings for salary, nonfinite values and unsafe integers. Validate UUID path params and lookup values.
3. Parse query parameters strictly: page default 1, pageSize default 25/max 100; reject invalid values with 400. Search trimmed/max 100 characters. Whitelist query keys and groupBy; never interpolate user text as SQL identifiers.
4. Centralize DTO serialization. BigInt → Number only after safe-range guard. Dates → ISO strings. Currency rates return decimal strings.
5. Define money helpers using decimal.js; parse UI decimal strings exactly, honor currency decimalPlaces, and round final USD cent outputs half-up. No binary floating-point currency calculation.
6. Add GET /api/health for infrastructure and GET /api/filter-options for controlled values and currency metadata/rates.
7. Establish module structure with routes, controller, service and repository functions, avoiding generic base classes.

## Contracts
Employee DTO: id, employeeCode, name, email, countryCode, department, level, salaryMinorUnits, currencyCode, createdAt, updatedAt.
History DTO: id, employeeId, salaryMinorUnits, currencyCode, changedAt.
List: { data: [...], total: integer, page: integer, pageSize: integer }.
Single create/update: { data: EmployeeDTO }.
Error: { error: { code: string, message: string, fields?: object } }.
400 invalid input, 404 missing employee, 409 duplicate code/email, 500 unexpected failure with generic message; no raw SQL/stack traces to clients.
Filter options: { data: { countries: [{code,name}], departments: [string], levels: [string], currencies: [{code,decimalPlaces,usdRate}] } }.

For query filtering use country=IN, department=Engineering, level=Junior; database field remains countryCode.
No authentication claims: synthetic-data assessment demo only.

## Files
server/src/middleware/error-handler.js; server/src/lib/errors.js; server/src/lib/validation.js; server/src/lib/serialize.js; server/src/lib/money.js; server/src/modules/options/...; server/test/unit/...; server/test/integration/api-errors.test.js.

## Tests
Safe bounds; 0/negative/fraction/unsafe values; strict body rejection; malformed JSON; invalid pagination and UUID; unsupported lookups; clean error output.
Exact conversion fixtures: INR 10000 paise at 0.012 gives 120 USD cents; JPY 100 yen at 0.0067 gives 67 cents; USD 101 cents remains 101.
A value landing at half a USD cent rounds half-up only at the response boundary.

## Acceptance
Consistent responses, error handling and money rules are tested before domain endpoints.
Commit: feat: establish validated API contracts and exact money handling.

