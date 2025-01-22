import http from 'http';
import util from 'util';
import logger from '../logger/LoggerManager';
import ApiError from './ApiError';
import { StatusCodes } from '../constants/http-status-code';

/**
 * Centralized error handling class.
 * Listens to various process-level error events and handles errors gracefully,
 * including shutting down the server when needed.
 */
class ErrorHandler {
  /**
   * Reference to the HTTP server for graceful shutdown.
   * @private
   */
  private httpServerRef: http.Server | null = null;

  /**
   * Starts listening to process-level error events and sets up handlers for them.
   *
   * @param {http.Server} httpServer - The HTTP server instance to be managed.
   * @returns {void}
   */
  public listenToErrorEvents(httpServer: http.Server): void {
    this.httpServerRef = httpServer;

    process.on('uncaughtException', async (error: Error) => {
      logger.error('Uncaught Exception:', error);
      await this.handleError(error);
    });

    process.on('unhandledRejection', async (reason: unknown) => {
      logger.error('Unhandled Rejection:', reason);
      await this.handleError(reason);
    });

    process.on('SIGTERM', async () => {
      logger.error('Received SIGTERM. Terminating server...');
      await this.terminateServer();
    });

    process.on('SIGINT', async () => {
      logger.error('Received SIGINT. Terminating server...');
      await this.terminateServer();
    });
  }

  /**
   * Handles an error and determines if the application should terminate.
   *
   * @param {unknown} error - The error to handle. Can be any type.
   * @returns {Promise<void>}
   */
  public async handleError(error: unknown): Promise<void> {
    try {
      const appError = this.normalizeError(error);

      if (!appError.operational) {
        await this.terminateServer();
      }
    } catch (handlingError) {
      logger.error('The error handler failed.');
      process.stdout.write(
        'The error handler failed. Here are the handler failure and then the origin error that it tried to handle: '
      );
      process.stdout.write(JSON.stringify(handlingError));
      process.stdout.write(JSON.stringify(error));
    }
  }

  /**
   * Gracefully shuts down the server and exits the process.
   *
   * @private
   * @returns {Promise<void>}
   */
  private async terminateServer(): Promise<void> {
    if (this.httpServerRef) {
      logger.warn('Gracefully shutting down the server...');
      await new Promise((resolve) => this.httpServerRef!.close(resolve)); // Graceful shutdown
      logger.warn('Server closed.');
    }
    console.log('Exiting process.');
    process.exit();
  }

  /**
   * Normalizes any error into an `ApiError` instance.
   *
   * @private
   * @param {unknown} error - The error to normalize.
   * @returns {ApiError} The normalized `ApiError` instance.
   */
  private normalizeError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    if (error instanceof Error) {
      return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }

    const inputType = typeof error;
    return new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error Handler received a non-error instance with type - ${inputType}, value - ${util.inspect(
        error
      )}`
    );
  }
}

export default ErrorHandler;
