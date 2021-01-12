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
   */
  app.get('/task/:id', (request) => {
    const { params } = request;
    const { id } = params;

    const encoding = 'utf8';
    const filename = join(__dirname, '../../database.json');
    const tasks = getTasks(filename, encoding);

    const index = tasks.findIndex(task => task.id === id);

    const data = tasks[index];

    return {
      success: true,
      data
    };
  });
};
