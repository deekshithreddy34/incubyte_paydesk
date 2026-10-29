-- Create pg_trgm extension for substring and pattern search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateTable
CREATE TABLE "Currency" (
    "code" VARCHAR(3) NOT NULL,
    "decimalPlaces" INTEGER NOT NULL,
    "usdRate" DECIMAL(18,8) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code"),
    CONSTRAINT "Currency_decimalPlaces_check" CHECK ("decimalPlaces" BETWEEN 0 AND 3),
    CONSTRAINT "Currency_usdRate_check" CHECK ("usdRate" > 0)
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "employeeCode" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "salaryMinorUnits" BIGINT NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Employee_salaryMinorUnits_check" CHECK ("salaryMinorUnits" BETWEEN 1 AND 9007199254740991)
);

-- CreateTable
CREATE TABLE "SalaryHistory" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "salaryMinorUnits" BIGINT NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL,
    "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryHistory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SalaryHistory_salaryMinorUnits_check" CHECK ("salaryMinorUnits" BETWEEN 1 AND 9007199254740991)
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_countryCode_idx" ON "Employee"("countryCode");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE INDEX "Employee_level_idx" ON "Employee"("level");

-- Trigram GIN indexes for literal case-insensitive substring search
CREATE INDEX "Employee_name_trgm_idx" ON "Employee" USING gin ("name" gin_trgm_ops);
CREATE INDEX "Employee_email_trgm_idx" ON "Employee" USING gin ("email" gin_trgm_ops);
CREATE INDEX "Employee_employeeCode_trgm_idx" ON "Employee" USING gin ("employeeCode" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "SalaryHistory_employeeId_changedAt_id_idx" ON "SalaryHistory"("employeeId", "changedAt", "id");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
