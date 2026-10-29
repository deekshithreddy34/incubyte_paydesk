import * as insightService from './insight.service.js';

export async function getPayInsights(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const result = await insightService.getPayInsights(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPayOutliers(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const result = await insightService.getPayOutliers(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

