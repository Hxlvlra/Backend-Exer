const { getTasks } = require('../../lib/get-tasks');
const { writeFileSync } = require('fs');
const { join } = require('path');

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
  app.delete('/task/:id', (request, response) => {
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

    tasks.splice(index, 1);

    // we added null and 2 when stringify-ing the object so that
    // the JSON file looks visually understandable
    const newDatabaseStringContents = JSON.stringify({ tasks }, null, 2);
    writeFileSync(filename, newDatabaseStringContents, encoding);

    return {
      success: true
    };
  });
};
