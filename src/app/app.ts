import express, { Application, Request, Response } from "express";
import dotenv from 'dotenv-flow';
import logger from '../shared/logger/LoggerManager';
import addRequestId from "../middlewares/addRequestId";
import requestLogger from "../middlewares/requestLogger";
import { StatusCodes } from "../shared/constants/http-status-code";
import globalErrorHandler from "../middlewares/globalErrorHandler";
import notFoundHandler from "../middlewares/notFoundHandler";
import ApiResponse from "../shared/api-handlers/ApiResponse";
import loadAllModules from "./modules";
import prisma from "../shared/prisma";

class AppFactory {
  static createApp(): Application {
    logger.info('Creating app...');

    dotenv.config();
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(addRequestId);
    app.use(requestLogger);

    app.get('/', async (req: Request, res: Response) => {
      const users = await prisma.user.findMany();
      ApiResponse(res, StatusCodes.OK, 'Welcome to the XPRS-TS API!', users);
    });

    const router = express.Router();
    loadAllModules(router);
    app.use('/api/v1', router);

    app.all('*', notFoundHandler);
    globalErrorHandler(app);

    return app;
  }
}

export default AppFactory;
