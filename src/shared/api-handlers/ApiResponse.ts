import { Response } from 'express';
import logger from '../logger/LoggerManager';

/**
 * Sends a standardized API response.
 *
 * Logs the response details using the logger and sends a JSON response with the specified
 * status code, message, and optional additional data.
 *
 * @param {Response} res - The Express response object.
 * @param {number} statusCode - The HTTP status code of the response.
 * @param {string} message - A descriptive message for the response.
 * @param {any} [data] - Optional data payload to include in the response.
 * @param {any} [links] - Optional links related to the response.
 * @param {any} [pagination] - Optional pagination metadata.
 * @returns {void}
 */
const ApiResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  links?: any,
  pagination?: any
): void => {
  // Log the response details
  logger.info(message, {
    responseCode: statusCode,
    url: res.req.originalUrl,
    headers: res.req.headers,
    body: res.req.body ? res.req.body : null,
  });

  // Construct the response object
  const responseObject: any = {
    success: true,
    statusCode,
    message,
    requestId: res.get('x-request-id'),
  };

  // Include optional data, links, and pagination if provided
  if (data !== undefined) {
    responseObject.data = data;
  }
  if (links !== undefined) {
    responseObject.links = links;
  }
  if (pagination !== undefined) {
    responseObject.pagination = pagination;
  }

  // Send the response
  res.status(statusCode).json(responseObject);
};

export default ApiResponse;
