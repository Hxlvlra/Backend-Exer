const { Task } = require('../../db');
const { definitions } = require('../../definitions');
const { GetOneTaskResponse, GetOneTaskParams } = definitions;

/**
 * Gets one task
 *
 * @param {*} app
 */
exports.get = app => {
  app.get('/task/:id', {
    schema: {
      description: 'Get one task',
      tags: ['Task'],
      summary: 'Get one task',
      params: GetOneTaskParams,
      response: {
        200: GetOneTaskResponse
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
      const { params, user } = request;
      const { username } = user;
      const { id } = params;

      const data = await Task.findOne({ id, username }).exec();
      
      if (!data) {
        return response
        .notFound('task/not-found')
      }

      return {
        success: true,
        data
      };
    }
  });
};
