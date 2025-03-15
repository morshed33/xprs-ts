import express, { type Application, type Request, type Response } from "express";
import dotenv from 'dotenv-flow';
import logger from '../shared/logger/LoggerManager';
import addRequestId from "../middlewares/addRequestId";
import requestLogger from "../middlewares/requestLogger";
import { StatusCodes } from "../shared/constants/http-status-code";
import globalErrorHandler from "../middlewares/globalErrorHandler";
import notFoundHandler from "../middlewares/notFoundHandler";
import ApiResponse from "../shared/api-handlers/ApiResponse";
import loadAllModules from "./modules";

/**
 * Creates and configures an Express application with all middleware and routes
 * @returns {Application} The configured Express application
 */
export function createApp(): Application {
  logger.info('Creating app...');

  dotenv.config();
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(addRequestId);
  app.use(requestLogger);

  app.get('/', async (_req: Request, res: Response) => {
    ApiResponse(res, StatusCodes.OK, 'Welcome to the XPRS-TS API!');
  });

  const router = express.Router();
  loadAllModules(router);
  app.use('/api/v1', router);

  app.all('*', notFoundHandler);
  globalErrorHandler(app);

  return app;
}

export default { createApp };
