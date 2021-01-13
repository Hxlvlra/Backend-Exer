const { Task } = require('../../db');

/**
 * Gets one task
 *
 * @param {*} app
 */
exports.get = app => {
  /**
   * This gets one task from the database given a unique ID
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply<Response>} response
   */
  app.get('/task/:id', async (request, response) => {

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
  });
};
