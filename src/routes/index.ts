import express, { Router } from 'express';
import { HealthController, PriceController } from '../controllers';

const indexRouter: Router = express.Router();

indexRouter.get('/health', HealthController.health);
indexRouter.get('/start', PriceController.start);

export default indexRouter;
