import express from 'express';
import * as salaryController from './salary.controller.js';
import { validateBody, validateQuery, validateParams } from '../../lib/validation.js';
import {
  updateSalarySchema,
  employeeIdParamSchema,
  getSalaryHistoryQuerySchema,
} from './salary.schemas.js';

const router = express.Router();

router.patch(
  '/employees/:id/salary',
  validateParams(employeeIdParamSchema),
  validateBody(updateSalarySchema),
  salaryController.updateSalary
);

router.get(
  '/employees/:id/salary-history',
  validateParams(employeeIdParamSchema),
  validateQuery(getSalaryHistoryQuerySchema),
  salaryController.getSalaryHistory
);

export default router;

