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
     * This updates one task from the database give a unique ID and a payload
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { params, body, user } = request;
      const { username } = user;
      const { id } = params;
      // get text and isDone from body.
      const { text, isDone } = body;

      // expect that we should be getting at least a text or a isDone property
      if (!text && (isDone === null || isDone === undefined)) {
        return response
        .badRequest('request/malformed');
      }

      const oldData = await Task.findOne({ id, username }).exec();

      if (!oldData) {
        return response
        .notFound('task/not-found')
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
