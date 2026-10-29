import * as employeeService from './employee.service.js';

export async function createEmployee(req, res, next) {
  try {
    const data = await employeeService.createEmployee(req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getEmployees(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const result = await employeeService.getEmployees(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
