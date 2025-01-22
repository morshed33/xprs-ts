import dotenv from 'dotenv';
import path from 'path';
import logger from '../shared/logger/LoggerManager';

/**
 * ConfigManager class is responsible for loading and managing environment-specific configuration
 * based on the NODE_ENV value (development, staging, production, etc.).
 * It loads the corresponding `.env` file and configuration module based on the current environment.
 */
class ConfigManager {
  private config: any;  // Holds the configuration module for the current environment

  constructor() {
    try {
      this.loadConfig();  // Load configuration during instantiation
    } catch (error) {
      logger.error('Error loading configuration:', error);
      process.exit(1);  // Exit the process if config loading fails
    }
  }

  /**
   * Loads environment variables and configuration based on NODE_ENV.
   * - Loads the appropriate `.env` file for the environment (e.g., `.env.production`, `.env.development`).
   * - Requires the corresponding config module based on NODE_ENV.
   */
  private loadConfig(): void {
    const nodeEnv = process.env.NODE_ENV || 'development';  // Default to 'development' if NODE_ENV is not set

    // Determine the path to the environment-specific .env file
    const envFile = `.env.${nodeEnv}`;
    const envFilePath = path.resolve(process.cwd(), envFile);  // Resolve the file path relative to the project root

    try {
      // Load environment variables from the .env file
      const result = dotenv.config({ path: envFilePath });

      if (result.error) {
        throw result.error;  // Throw error if loading the .env file fails
      }

      // Load the corresponding configuration module based on NODE_ENV
      let configModule;

      switch (nodeEnv) {
        case 'production':
          configModule = require('./production').default;  // Load production config
          break;
        case 'staging':
          configModule = require('./staging').default;  // Load staging config
          break;
        case 'development':
        default:
          configModule = require('./development').default;  // Load development config (default)
          break;
      }

      // Assign the appropriate configuration module to the config property
      this.config = configModule;
    } catch (error: any) {
      // Log error and rethrow with a message to notify about which config failed to load
      logger.error(`Error loading ${envFile}:`, error);
      throw new Error(error.message);  // Re-throw the error to stop further execution
    }
  }

  /**
   * Retrieves a configuration value based on the provided key.
   * Throws an error if the key is not found in the current environment's configuration.
   *
   * @param key - The key to look up in the configuration
   * @returns The value associated with the provided key
   * @throws Error if the key doesn't exist in the configuration
   */
  get(key: string): any {
    // Check if the key exists in the current config; throw an error if not
    if (!this.config[key]) {
      throw new Error(`No value exists for "${key}" in ${process.env.NODE_ENV} config files`);
    }

    // Return the value associated with the key
    return this.config[key];
  }
}

// Create an instance of the ConfigManager to load and manage the configuration
const appConfig = new ConfigManager();

export default appConfig;
