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
      }
    },
    /**
     * This gets one tasks from the database give a unique ID
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { params } = request;
      const { id } = params;

      const data = await Task.findOne({ id }).exec();

      if (!data) {
        return response
          .code(404)
          .send({
            success: false,
            code: 'task/not-found',
            message: 'Task doesn\'t exist'
          });
      }

      return {
        success: true,
        data
      };
    }
  });
};
