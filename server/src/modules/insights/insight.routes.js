import express from 'express';
import * as insightController from './insight.controller.js';
import { validateQuery } from '../../lib/validation.js';
import { getInsightsQuerySchema, getOutliersQuerySchema } from './insight.schemas.js';

const router = express.Router();

router.get(
  '/pay-insights',
  validateQuery(getInsightsQuerySchema),
  insightController.getPayInsights
);

router.get(
  '/pay-insights/outliers',
  validateQuery(getOutliersQuerySchema),
  insightController.getPayOutliers
);

export default router;

