const { User } = require('../../db');
const { definitions } = require('../../definitions');
const { GetOneUserResponse, GetOneUserParams } = definitions;

/**
 * Gets one user
 *
 * @param {*} app
 */
exports.get = app => {
  app.get('/user/:username', {
    schema: {
      description: 'Get one user',
      tags: ['User'],
      summary: 'Get one user',
      params: GetOneUserParams,
      response: {
        200: GetOneUserResponse
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
     * This gets one tasks from the database give a unique ID
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { params } = request;
      const { username } = params;

      const data = await User.findOne({ username }).exec();
      
      if (!data) {
        return response
        .notFound('user/not-found')
      }

      return {
        success: true,
        data
      };
    }
  });
};
