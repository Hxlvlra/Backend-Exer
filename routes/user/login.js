const bcrypt = require('bcrypt');
const { User } = require('../../db');
const { definitions } = require('../../definitions');
const { SuccessResponse, LoginUserRequest } = definitions;

/**
 * this is the route for creating a user
 *
 * @param {*} app
 */
exports.login = app => {
  app.post('/login', {
    schema: {
      description: 'Logs in a user',
      tags: ['User'],
      summary: 'Logs in a user',
      body: LoginUserRequest,
      response: {
        200: SuccessResponse
      }
    },
    /**
     * handles the request for a given route
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { body } = request;
      const { username, password } = body;

      const user = await User.findOne({ username }).exec();

      if (!(await bcrypt.compare(password, user.password))) {
        return response
        .unauthorized('auth/wrong-password')
      }

      return {
        success: true
      }
    }
  })
};
