const { Task } = require('../../db');

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
  app.put('/task/:id', async (request, response) => {
    const { params, body } = request;
    const { id } = params;
    // get text and isDone from body.
    const { text, isDone } = body || {};

    // expect that we should be getting at least a text or a isDone property
    if (!text && (isDone === null || isDone === undefined)) {
      return response
        .code(400)
        .send({
          success: false,
          code: 'task/malformed',
          message: 'Payload doesn\'t have text and isDone property'
        });
    }

    const oldData = await Task.findOne({ id }).exec();

    if (!oldData) {
      return response
        .code(404)
        .send({
          success: false,
          code: 'task/not-found',
          message: 'Task doesn\'t exist'
        });
    }

    const update = {};

    if (text) {
      update.text = text;
    }
    if (isDone !== undefined && isDone !== null) {
      update.isDone = isDone;
    }

    update.dateUpdated = new Date().getTime();

    const data = await Task.findOneAndUpdate(
      { id },
      update,
      { new: true }
    )
      .exec();

    return {
      success: true,
      data
    };
  });
};
