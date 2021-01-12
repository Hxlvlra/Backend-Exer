/**
 * initialize all the routes
 *
 * @param {*} app
 */
exports.routes = (app) => {
    // access root address - http://localhost/
    app.get('/', {
      /**
       * handles the request for a given route
       */
      handler: async (req) => {
        // this is the response in JSON format
        return { success: true }
      }
    });
  }
  