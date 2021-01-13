const { definitions } = require('../../definitions');
const { SuccessResponse } = definitions;

/**
 * this is the route for checking if the user is authenticated
 *
 * @param {*} app
 */
exports.auth = app => {
  app.get('/auth', {
    schema: {
      description: 'Check authentication of a user',
      tags: ['User'],
      summary: 'Check authentication of a user',
      response: {
        200: SuccessResponse
      },
      security: [
        {
          bearer: []
        }
      ]
    },
    preHandler: app.auth([
      app.verifyJWT
    ]),
    /**
     * handles the request for a given route
     *
     */
    handler: async () => {
      return {
        success: true
      }
    }
  })
};
