import { Request, Response } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Extend the Winston Logger interface to include custom methods for logging requests and errors
interface CustomLogger extends winston.Logger {
  logRequest(req: Request, res: Response, responseTime: number, requestId: string): void;
  logError(error: any, requestId: string, req: Request): void; // New method to log errors
}

class LoggerManager {
  /**
   * Creates and configures a custom logger with various transports for different log levels.
   * @returns CustomLogger instance with extended logging capabilities
   */
  static createLogger(): CustomLogger {
    // Define log levels with corresponding severity
    const logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    // Define colors for each log level to improve readability in the console
    const colors = {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'blue',
    };

    // Add colors to the logger to enhance visual output in the console
    winston.addColors(colors);

    // Console log format to display colored logs with timestamp and custom message structure
    const consoleFormat = winston.format.combine(
      winston.format.colorize({ all: true }),  // Colorize all logs
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp in each log entry
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        // Format log message to include metadata (if available) in a structured manner
        let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${level}: ${message} ${metaStr}`;
      })
    );

    // File log format to output logs as JSON for better machine parsing
    const fileFormat = winston.format.combine(
      winston.format.timestamp(),  // Include timestamp in each log entry
      winston.format.json()        // Format logs as JSON for easy parsing and indexing
    );

    // Initialize Winston logger instance with multiple transports
    const logger = winston.createLogger({
      levels: logLevels,
      level: process.env.NODE_ENV === 'production' ? 'http' : 'debug', // Set log level based on environment (production: http, development: debug)
      transports: [
        // Console transport for logging to the terminal
        new winston.transports.Console({
          format: consoleFormat,    // Use the custom console format
          level: 'http',            // Log HTTP requests to the console
        }),
        // Daily rotating file transport for application logs
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',  // Logs are saved with a timestamped filename
          datePattern: 'YYYY-MM-DD',  // Rotate logs daily
          maxSize: '20m',             // Limit file size to 20MB before rotating
          maxFiles: '14d',            // Retain logs for the last 14 days
          format: fileFormat,         // Use the JSON format for file logs
          level: 'info',              // Log info level and above in application logs
        }),
        // Daily rotating file transport for HTTP request logs
        new DailyRotateFile({
          filename: 'logs/requests-%DATE%.log',  // Separate log file for HTTP requests
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'http',              // Only log HTTP requests in this file
          format: fileFormat,
        }),
        // Daily rotating file transport for error logs
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',    // Separate log file for errors
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',              // Only log error-level messages in this file
          format: fileFormat,
        }),
      ],
    }) as CustomLogger;

    // Custom method to log HTTP requests, including response times and additional request data
    logger.logRequest = (req: Request, res: Response, responseTime: number, requestId: string) => {
      const logData = {
        requestId,                     // Unique request identifier
        timestamp: new Date().toISOString(),
        method: req.method,            // HTTP method (GET, POST, etc.)
        url: req.originalUrl,          // Full requested URL
        statusCode: res.statusCode,    // HTTP response status code
        responseTime: `${responseTime}ms`, // Time taken to process the request
        ip: req.ip,                    // Client's IP address
        userAgent: req.get('user-agent'),  // User-agent header (browser details)
        headers: req.headers,          // Request headers
        query: req.query,              // Query parameters from the URL
        body: req.method !== 'GET' && req.method !== 'DELETE' ? req.body : undefined,  // Log request body for non-GET and non-DELETE requests
      };

      logger.http('HTTP Request', logData);  // Log the HTTP request to the console and request logs
    };

    // Custom method to log errors with stack trace and additional request information
    logger.logError = (error: any, requestId: string, req: Request) => {
      const logData = {
        success: false,
        requestId,                     // Unique request identifier
        timestamp: new Date().toISOString(),
        method: req.method,            // HTTP method that caused the error
        url: req.originalUrl,          // URL that caused the error
        statusCode: error.statusCode || 500,  // HTTP status code (default to 500 if not provided)
        message: error.message,        // Error message
        stack: error.stack,            // Error stack trace for debugging
        ip: req.ip,                    // Client's IP address
        userAgent: req.get('user-agent'),  // User-agent header (browser details)
        headers: req.headers,          // Request headers
        query: req.query,              // Query parameters from the URL
        body: req.body,                // Request body (if available)
      };

      logger.error('Error Occurred', logData);  // Log the error to the console and error logs
    };

    return logger;
  }
}

// Create and export a logger instance
const logger = LoggerManager.createLogger();
export default logger;
