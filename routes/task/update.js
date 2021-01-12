const { getTasks } = require('../../lib/get-tasks');
const { writeFileSync } = require('fs');
const { join } = require('path');

/**
 * Updates one task
 *
 * @param {*} app
 */
exports.update = app => {
  /**
   * This updates one task from the database given a unique ID and a payload
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply<Response>} response
   */
  app.put('/task/:id', (request, response) => {
    const { params, body } = request;
    const { id } = params;
    // get text and isDone from body.
    const { text, isDone } = body || {};

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

    // expect that we should be getting at least a text or a isDone property
    if (!text && (isDone === null || isDone === undefined)) {
      return response
        .code(400)
        .send({
          success: false,
          code: 'task/malformed',
          message: 'Payload doesn\'t have text or isDone property'
        });
    }

    const data = tasks[index];

    if (text) {
      data.text = text;
    }
    if (isDone) {
      data.isDone = isDone;
    }

    tasks[index] = data;

    // we added null and 2 when stringify-ing the object so that
    // the JSON file looks visually understandable
    const newDatabaseStringContents = JSON.stringify({ tasks }, null, 2);
    writeFileSync(filename, newDatabaseStringContents, encoding);

    return {
      success: true,
      data
    };
  });
};
