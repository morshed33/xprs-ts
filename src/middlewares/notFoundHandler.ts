import { NextFunction, Request, Response } from 'express';
import ApiError from '../shared/api-handlers/ApiError';
import { StatusCodes } from '../shared/constants/http-status-code';

export default function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Can't find your requested url: '${req.originalUrl}' in the server`
    )
  );
}
