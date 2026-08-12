import morgan from 'morgan';
import logger from '../services/logger.js';

const stream = {
  write: (message) => {
    logger.info(message.trim(), { type: 'http_request' });
  },
};

export const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms', { stream });

export default requestLogger;
