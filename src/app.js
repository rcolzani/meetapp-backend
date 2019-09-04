import 'dotenv/config';

import express from 'express';
import * as Sentry from '@sentry/node';
import sentryConfig from './config/sentry';
import routes from './routes';
import './database';
import 'express-async-errors';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler())
  }
}

export default new App().server;
