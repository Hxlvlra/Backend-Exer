const { Task } = require('../../db');

/**
 * Deletes one task
 *
 * @param {*} app
 */
exports.deleteOne = app => {
  /**
   * This deletes one task from the database given a unique ID
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply<Response>} response
   */
  app.delete('/task/:id', async (request, response) => {
    const { params } = request;
    const { id } = params;

    const data = await Task.findOneAndDelete({ id }).exec();

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
      success: true
    };
  });
};
