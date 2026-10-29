import express from 'express';
import * as employeeController from './employee.controller.js';
import { validateBody, validateQuery } from '../../lib/validation.js';
import { createEmployeeSchema, getEmployeesQuerySchema } from './employee.schemas.js';

const router = express.Router();

router.post(
  '/employees',
  validateBody(createEmployeeSchema),
  employeeController.createEmployee
);

router.get(
  '/employees',
  validateQuery(getEmployeesQuerySchema),
  employeeController.getEmployees
);

export default router;

