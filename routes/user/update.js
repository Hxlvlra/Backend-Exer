const { User } = require('../../db');
const { definitions } = require('../../definitions');
const { GetOneUserResponse, GetOneUserParams, PutUserRequest } = definitions;

/**
 * Updates one task
 *
 * @param {*} app
 */
exports.update = app => {
  app.put('/user/:id', {
    schema: {
      description: 'Update one user',
      tags: ['User'],
      summary: 'Update one User',
      body: PutUserRequest,
      params: GetOneUserParams,
      response: {
        200: GetOneUserResponse
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
      const { username } = params;
      // get text and isDone from body.
      const { password, firstName, lastName, isAdmin } = body;

      // expect that we should be getting at least a text or a isDone property
      if (!password && !firstName && !lastName && !isAdmin) {
        return response
        .badRequest('request/malformed');
      }

      const oldData = await User.findOne({ username }).exec();

      if (!oldData) {
        return response
        .notFound('task/not-found')
      }

      const update = {};

      if (password) {
        update.password = password;
      }
      if (firstName) {
        update.firstName = firstName;
      }
      if (lastName) {
        update.lastName = lastName;
      }
      if (isAdmin) {
        update.isAdmin = isAdmin;
      }

      update.dateUpdated = new Date().getTime();

      const data = await User.findOneAndUpdate(
        { username },
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
