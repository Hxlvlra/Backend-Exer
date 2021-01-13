const fastify = require('fastify');
const swagger = require('fastify-swagger');
const sensible = require('fastify-sensible');
const { errorHandler } = require('./error-handler.js');
const { definitions } = require ('./definitions')
const { routes } = require('./routes');
const { connect } = require('./db');
const { name: title, description, version } = require ('./package.json');

/**
 * This is the function to call to initialize the server
 *
 * @param {{ logger: boolean, trustProxy: boolean }} opts
 * @returns {*}
 */
exports.build = async (opts = { logger: false, trustProxy: false }) => {
  // initialize our server using Fastify
  const app = fastify(opts);

  app.register(sensible).after(() => {
    app.setErrorHandler(errorHandler);
  });

  app.register(swagger, {
    routePrefix: '/docs',
    exposeRoute: true,
    swagger: {
      info: {
        title,
        description,
        version
      },
      schemes: ['http', 'https'],
      consume: ['application/json'],
      produce: ['application/json'],
      definitions 
    }
  })

  await connect();

  routes(app);

  return app;
};
