const { Task } = require('../../db');
const { definitions } = require('../../definitions');
const { SuccessResponse, GetOneTaskParams } = definitions;

/**
 * Deletes one task
 *
 * @param {*} app
 */
exports.deleteOne = app => {
  app.delete('/task/:id', {
    schema: {
      description: 'Delete one task',
      tags: ['Task'],
      summary: 'Delete one task',
      params: GetOneTaskParams,
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
   * This deletes one task from the database given a unique ID
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply<Response>} response
   */
    handler: async (request, response) => {
      const { params } = request;
      const { id } = params;

      const data = await Task.findOneAndDelete({ id }).exec();

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
