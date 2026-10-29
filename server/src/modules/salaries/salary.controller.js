import * as salaryService from './salary.service.js';

export async function updateSalary(req, res, next) {
  try {
    const data = await salaryService.updateSalary(req.params.id, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getSalaryHistory(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const result = await salaryService.getSalaryHistory(req.params.id, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

