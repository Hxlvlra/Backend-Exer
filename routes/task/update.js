const { Task } = require('../../db');
const { definitions } = require('../../definitions');
const { GetOneTaskResponse, GetOneTaskParams, PutTaskRequest } = definitions;

/**
 * Updates one task
 *
 * @param {*} app
 */
exports.update = app => {
  app.put('/task/:id', {
    schema: {
      description: 'Update one task',
      tags: ['Task'],
      summary: 'Update one task',
      body: PutTaskRequest,
      params: GetOneTaskParams,
      response: {
        200: GetOneTaskResponse
      }
    },
    /**
     * This updates one task from the database give a unique ID and a payload
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { params, body } = request;
      const { id } = params;
      // get text and isDone from body.
      const { text, isDone } = body;

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
    }
  });
};
