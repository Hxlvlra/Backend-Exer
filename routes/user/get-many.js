const { User } = require('../../db');
const { definitions } = require('../../definitions');
const { GetManyUsersResponse, GetManyUsersQuery } = definitions;

/**
 * Gets many tasks
 *
 * @param {*} app
 */
exports.getMany = app => {
  app.get('/user', {
    schema: {
      description: 'Gets many users',
      tags: ['User'],
      summary: 'Gets many users',
      query: GetManyUsersQuery,
      response: {
        200: GetManyUsersResponse
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
     * handles the request for a given route
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { query } = request;
      const { limit = 10, startDateCreated, endDateCreated, startDateUpdated, endDateUpdated, startUsername, endUsername } = query;

      if (parseInt(limit) > 50) {
        return response
        .badRequest('request/malformed');
      }

      const options = { };
      
      if (startUsername){
        options.username = {};
        options.username.$gte = startUsername;
      }
      if (endUsername){
        options.username = options.username || {};
        options.username.$gte = endUsername;
      }
      if (startDateCreated) {
        options.dateCreated = {};
        options.dateCreated.$gte = startDateCreated;
      }
      if (endDateCreated) {
        options.dateCreated = options.dateCreated || {};
        options.dateCreated.$lte = endDateCreated;
      }
      if (startDateUpdated) {
        options.dateUpdated = {};
        options.dateUpdated.$gte = startDateUpdated;
      }
      if (endDateUpdated) {
        options.dateUpdated = options.dateUpdated || {};
        options.dateUpdated.$lte = endDateUpdated;
      }

      const data = await User
        .find(options)
        .limit(parseInt(limit))
        .sort({
          // this forces to start the query on startUsername if and when
          // startUsername only exists.
          startUsername: startUsername && !endUsername ? 1 : -1
        })
        .exec();

      // force sort to do a descending order
      if (startUsername && !endDateUpdated) {
        data.sort((prev, next) => next.username - prev.username)
      }

    return {
      success: true,
      data
    };
  }
  });
};
  