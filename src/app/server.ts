import { Application } from 'express';
import { Server as HTTPServer } from 'http';
import config from '../configs';
import logger from '../shared/logger/LoggerManager';
import AppFactory from './app';
import ErrorHandler from '../shared/api-handlers/ErrorHandler';

/**
 * ServerDto defines the structure of the server information that is returned when the server is started.
 */
interface ServerDto {
  port: number; // Port the server is listening on
  address: string | string[] | null; // The server's address, which could be a string or an array of strings
}

/**
 * Server class handles the setup, configuration, and lifecycle of the HTTP server.
 * It handles server startup, termination, and error handling.
 */
class Server {
  private connection: HTTPServer | undefined;

  /**
   * Runs the server, starts the HTTP server and returns server details.
   * @returns {Promise<ServerDto>} - A promise that resolves with the server details (port and address).
   */
  public async run(): Promise<ServerDto> {
    const expressApp = AppFactory.createApp();
    const server = await this.openConnection(expressApp);
    return server;
  }

  /**
   * Terminates the server gracefully, closing any open connections.
   * @returns {Promise<void>} - A promise that resolves when the server is successfully terminated.
   */
  public async terminate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.connection) {
        // Close the connection and resolve or reject based on success
        this.connection.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        // If the server is not running, reject the promise
        reject(new Error('Server is not running'));
      }
    });
  }

  /**
   * Opens a connection to the server by starting the Express application.
   * @param {Application} expressApp - The Express application instance to be started.
   * @returns {Promise<ServerDto>} - A promise that resolves with the server's address and port details.
   */
  private async openConnection(expressApp: Application): Promise<ServerDto> {
    return new Promise<ServerDto>((resolve, reject) => {
      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

      // Ensure the port is a valid number
      if (isNaN(port)) {
        reject(new Error('Invalid port number'));
        return;
      }

      // Start the Express app and listen on the specified port
      this.connection = expressApp.listen(port, () => {
        const environment = config.get('environment') as string;

        // Log server startup info
        logger.info(`Configuring ${environment} server...`);

        // Only attach error handler once the connection is established
        if (this.connection) {
          const errorHandler = new ErrorHandler();
          errorHandler.listenToErrorEvents(this.connection); // Set up error events handler
        }

        // Get the address of the server after it starts listening
        const address = this.connection?.address();
        if (address && typeof address === 'object' && address.address && address.port) {
          // Resolve with the server details (port and address)
          resolve({
            port: address.port,
            address: address.address as string, // Ensure address is a string
          });
        } else {
          // If address cannot be retrieved, reject with an error
          reject(new Error('Failed to retrieve server address.'));
        }
      });
    });
  }
}

export default Server;
