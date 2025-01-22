/**
 * Custom error class to handle API-specific errors.
 * Extends the built-in `Error` class and adds additional properties.
 */
class ApiError extends Error {
  /** The HTTP status code for the error */
  statusCode: number;

  /** Indicates whether the operation was successful (always false for errors) */
  success: boolean;

  /** Specifies if the error is operational (intended to be handled by the application) */
  operational: boolean;

  /**
   * Object containing the error message and optional details.
   * @property {string} message - The main error message.
   * @property {Array<{field: string; message: string; location: string}>} [details] - Additional details about the error.
   */
  errors: {
    message: string;
    details?: Array<{ field: string; message: string; location: string }>;
  };

  /**
   * Creates an instance of ApiError.
   * @param {number} statusCode - The HTTP status code for the error.
   * @param {string} message - A descriptive message for the error.
   * @param {Array<{field: string; message: string; location: string}>} [details] - Optional detailed information about the error.
   */
  constructor(
    statusCode: number,
    message: string,
    details?: Array<{ field: string; message: string; location: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.operational = true;
    this.errors = { message, details };
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export default ApiError;
