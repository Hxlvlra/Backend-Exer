const { getTasks } = require('../../lib/get-tasks');
const { join } = require('path');

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
  app.get('/task/:id', (request, response) => {

    const { params } = request;
    const { id } = params;

    const encoding = 'utf8';
    const filename = join(__dirname, '../../database.json');
    const tasks = getTasks(filename, encoding);

    const index = tasks.findIndex(task => task.id === id);

    if (index < 0) {
      return response
        .code(404)
        .send({
          success: false,
          code: 'task/not-found',
          message: 'Task doesn\'t exist'
        });
    }

    const data = tasks[index];

    return {
      success: true,
      data
    };
  });
};
