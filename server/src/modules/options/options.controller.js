import * as optionsService from './options.service.js';

export async function getOptions(req, res, next) {
  try {
    const data = await optionsService.getFilterOptions();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

