const fastify = require('fastify');

/**
 * This is the function to call to initialize the server
 *
 * @param {{ logger: boolean, trustProxy: boolean }} opts
 * @returns {*}
 */
exports.build = async (opts = { logger: true, trustProxy: true }) => {
  // initialize our server using Fastify
  const app = fastify(opts);

  // access root address - http://localhost/
  app.get('/', {
    // object

    /**
     * @param {*} req - this is the request parameter that is sent by the client
     */
    handler: async (req) => {
      console.log('hello world');

      // this is the response in JSON format
      return { success: true }
    }
  });

  return app;
};
