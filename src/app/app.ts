import express, { Application, Request, Response } from "express";
import dotenv from 'dotenv-flow';
import logger from '../shared/logger/LoggerManager';
import addRequestId from "../middlewares/addRequestId";
import requestLogger from "../middlewares/requestLogger";
import { StatusCodes } from "../shared/constants/http-status-code";

class AppFactory {
  static createApp(): Application {
    logger.info('Creating app...');
    dotenv.config();
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(addRequestId);
    app.use(requestLogger);

    app.get('/', (req: Request, res: Response) => {
      res.status(200).json(
        {
          success: true,
          statusCode: StatusCodes.OK,
          message: "Server is running... 🚀",
          requestId: res.get('x-request-id')
        }
      );
    });


    return app;
  }
}

export default AppFactory;
