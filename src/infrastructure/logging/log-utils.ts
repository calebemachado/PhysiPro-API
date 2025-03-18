import { logger } from './logger';

/**
 * Log database operations
 */
export const dbLogger = {
  query: (query: string, params?: any[], duration?: number) => {
    logger.debug('DB Query', { query, params, duration });
  },
  error: (error: Error, query?: string, params?: any[]) => {
    logger.error('DB Error', { error: error.message, stack: error.stack, query, params });
  },
  info: (message: string, metadata?: any) => {
    logger.info(`DB: ${message}`, metadata);
  }
};

/**
 * Log API requests with useful context
 */
export const apiLogger = {
  request: (req: any, res: any) => {
    const { method, originalUrl, ip, body, query, params, headers } = req;
    // Don't log sensitive information
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';

    logger.info(`API Request: ${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      ip,
      body: sanitizedBody,
      query,
      params,
      userAgent: headers['user-agent'],
    });
  },
  response: (req: any, res: any, duration: number) => {
    const { method, originalUrl } = req;
    const { statusCode } = res;

    logger.info(`API Response: ${method} ${originalUrl} ${statusCode}`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
    });
  },
  error: (req: any, error: Error) => {
    const { method, originalUrl, ip, body, query, params } = req;

    logger.error(`API Error: ${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      ip,
      error: error.message,
      stack: error.stack,
      body,
      query,
      params,
    });
  }
};

/**
 * Log authentication events
 */
export const authLogger = {
  login: (userId: string, success: boolean, ip: string, userAgent: string) => {
    if (success) {
      logger.info(`User login successful: ${userId}`, { userId, ip, userAgent });
    } else {
      logger.warn(`User login failed: ${userId}`, { userId, ip, userAgent });
    }
  },
  logout: (userId: string, ip: string) => {
    logger.info(`User logout: ${userId}`, { userId, ip });
  },
  passwordReset: (userId: string, ip: string) => {
    logger.info(`Password reset requested: ${userId}`, { userId, ip });
  }
};

/**
 * Log general application events
 */
export const appLogger = {
  startup: (message: string, details?: any) => {
    logger.info(`App startup: ${message}`, details);
  },
  shutdown: (message: string, details?: any) => {
    logger.info(`App shutdown: ${message}`, details);
  },
  config: (config: any) => {
    // Sanitize sensitive information
    const sanitizedConfig = { ...config };
    if (sanitizedConfig.DB_PASSWORD) sanitizedConfig.DB_PASSWORD = '[REDACTED]';
    if (sanitizedConfig.JWT_SECRET) sanitizedConfig.JWT_SECRET = '[REDACTED]';

    logger.info('App configuration loaded', sanitizedConfig);
  }
};
