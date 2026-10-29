import express from 'express';
import * as optionsController from './options.controller.js';

const router = express.Router();

router.get('/filter-options', optionsController.getOptions);

export default router;

