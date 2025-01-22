import { Application, NextFunction, Request, Response } from 'express';
import ErrorHandler from '../shared/api-handlers/ErrorHandler';
import logger from '../shared/logger/LoggerManager';
import { StatusCodes } from '../shared/constants/http-status-code';

/**
 * Interface for the structure of the response error data.
 */
interface ResponseData {
  success: boolean;
  statusCode: number;
  errors: {
    message: string;
    details?: Array<{ field: string; message: string; location: string }>; // Optional field to detail validation errors
  };
  operational?: boolean; // Whether the error is operational (e.g., user input validation error)
  requestId?: string; // A unique ID for the request for tracing purposes
  stack?: string; // Stack trace for debugging in development
}

/**
 * Global error handler middleware for Express.
 * It catches all unhandled errors in the application, logs them, and formats the response to the client.
 * 
 * @param expressApp - The Express application instance.
 */
export default function globalErrorHandler(expressApp: Application) {
  // Use Express's error-handling middleware to catch all errors
  expressApp.use((error: any, req: Request, res: Response, next: NextFunction) => {

    // Log the incoming error to the console for visibility (this could be removed in production)
    console.log('🚀 ~ globalErrorHandler ~ error:', error);

    // Ensure the error object has a defined 'operational' property
    // Operational errors are expected and should be handled gracefully.
    if (error && typeof error === 'object') {
      if (error.operational === undefined || error.operational === null) {
        error.operational = true; // Default to true for operational errors
      }
    }

    // Get the request ID for tracing the error response
    const requestId = res.get('X-Request-Id')!;

    // Create an instance of the AppErrorHandler to process the error (logging and categorizing)
    const errorHandler = new ErrorHandler();
    errorHandler.handleError(error); // This will handle logging and categorizing the error if necessary

    // Structure the response data in a consistent format
    const responseData: ResponseData = {
      success: error.success || false, // Indicate success (default false if not present in error object)
      statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, // Default to internal server error if status code is missing
      errors: error.errors || { message: 'An unexpected error occurred' }, // Default error message if errors are missing
      operational: error.operational, // Operational flag to indicate if the error is expected
      requestId: res.get('X-Request-Id'), // Include the request ID for tracing purposes
    };

    // Log the error details (including request information) for further debugging and monitoring
    logger.logError(error, requestId, req);

    // If in development mode, include the stack trace for debugging
    if (process.env.NODE_ENV === 'development') {
      responseData.stack = error.stack || new Error().stack; // Include the error stack trace for development debugging
    }

    // Send the structured error response back to the client
    res.status(error?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
  });
}
