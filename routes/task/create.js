const { Task } = require('../../db');
const { definitions } = require('../../definitions');
const { GetOneTaskResponse, PostTaskRequest } = definitions;

/**
 * this is the route for creating tasks
 *
 * @param {*} app
 */
exports.create = app => {
  app.post('/task', {
    schema: {
      description: 'Create one task',
      tags: ['Task'],
      summary: 'Create one task',
      body: PostTaskRequest,
      response: {
        200: GetOneTaskResponse
      }
    },
    /**
     * handles the request for a given route
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { body } = request;
      // get text and isDone with default false from body, regardless if it has
      // a object value or null, which makes it return an empty object.
      const { text, isDone = false } = body;

/*       if (!text) {
        return response
          .code(400)
          .send({
            success: false,
            code: 'task/malformed',
            message: 'Payload doesn\'t have text property'
          });
      } */

      const data = new Task({
        text,
        isDone,
      });

      await data.save();

      return {
        success: true,
        data
      }
    }
  })
};
