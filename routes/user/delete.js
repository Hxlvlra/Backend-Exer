const { User } = require('../../db');
const { definitions } = require('../../definitions');
const { SuccessResponse, GetOneUserParams } = definitions;

/**
 * Deletes one user
 *
 * @param {*} app
 */
exports.deleteOne = app => {
  app.delete('/user/:username', {
    schema: {
      description: 'Delete one user',
      tags: ['User'],
      summary: 'Delete one user',
      params: GetOneUserParams,
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
   * This deletes one User from the database given a unique ID
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply<Response>} response
   */
    handler: async (request, response) => {
      const { params } = request;
      const { username } = params;

      const data = await User.findOneAndDelete({ username }).exec();

      if (!data) {
        return response
        .notFound('task/not-found')
      }

      return {
        success: true
      };
    }
  });
};
