import type { Application } from 'express';
import type { Server as HTTPServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import config from '../configs';
import logger from '../shared/logger/LoggerManager';
import { createApp } from './app';
import ErrorHandler from '../shared/api-handlers/ErrorHandler';

/**
 * ServerDto defines the structure of the server information that is returned when the server is started.
 */
interface ServerDto {
  port: number;
  address: string;
}

let serverConnection: HTTPServer | undefined;

/**
 * Runs the server and returns server details.
 */
export async function run(): Promise<ServerDto> {
  const expressApp = createApp();
  return openConnection(expressApp);
}

/**
 * Terminates the server gracefully.
 */
export async function terminate(): Promise<void> {
  if (!serverConnection) {
    throw new Error('Server is not running');
  }

  return new Promise<void>((resolve, reject) => {
    serverConnection?.close((error) => {
      serverConnection = undefined;
      if (error) reject(error);
      else resolve();
    });
  });
}

/**
 * Opens a connection by starting the Express application and returns a promised data transfer object
 */
function openConnection(expressApp: Application): Promise<ServerDto> {
  const defaultPort = 8000;
  const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : defaultPort;

  if (Number.isNaN(port)) {
    throw new Error('Invalid port number');
  }

  return new Promise<ServerDto>((resolve, reject) => {
    serverConnection = expressApp.listen(port, () => {
      try {
        const environment = config.get('environment') as string;
        logger.info(`Configuring ${environment} server...`);

        // Set up error handling
        if (serverConnection) {
          new ErrorHandler().listenToErrorEvents(serverConnection);
        }

        // Get server address info
        const addressInfo = serverConnection?.address() as AddressInfo;
        if (!addressInfo || typeof addressInfo !== 'object') {
          throw new Error('Failed to retrieve server address');
        }

        resolve({
          port: addressInfo.port,
          address: addressInfo.address,
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }).on('error', (error) => {
      logger.error(`Server failed to start: ${error.message}`);
      reject(error);
    });
  });
}

export default { run, terminate };
