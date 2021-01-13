const fastify = require('fastify');
const swagger = require('fastify-swagger');
const sensible = require('fastify-sensible');
const jwt = require('fastify-jwt');
const { readFileSync } = require('fs');
const { errorHandler } = require('./error-handler.js');
const { definitions } = require ('./definitions')
const { routes } = require('./routes');
const { connect } = require('./db');
const { name: title, description, version } = require ('./package.json');

const audience = 'this-audience';
const issuer = 'localhost';

/**
 * This is the function to call to initialize the server
 *
 * @param {{ logger: boolean, trustProxy: boolean }} opts
 * @returns {*}
 */
exports.build = async (opts = { logger: false, trustProxy: false }) => {
  // initialize our server using Fastify
  const app = fastify(opts);

  app.register(jwt, {
    secret: {
      private: readFileSync('./cert/keyfile', 'utf8'),
      public: readFileSync('./cert/keyfile.key.pub', 'utf8')
    },
    sign: {
      algorithm: 'RS256',
      audience,
      issuer,
      expiresIn: '1h'
    },
    verify: {
      audience,
      issuer
    }
  });


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
