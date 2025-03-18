import { dbLogger } from './log-utils';

/**
 * Custom logger for Sequelize
 */
export const sequelizeLogger = {
  debug: function (message: string): void {
    dbLogger.query(message);
  },
  info: function (message: string): void {
    dbLogger.info(message);
  },
  warn: function (message: string): void {
    dbLogger.info(`WARNING: ${message}`);
  },
  error: function (message: string | Error): void {
    if (message instanceof Error) {
      dbLogger.error(message);
    } else {
      dbLogger.error(new Error(message));
    }
  }
};
