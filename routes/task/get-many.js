const { Task } = require('../../db');
const { definitions } = require('../../definitions');
const { GetManyTaskResponse, GetManyTaskQuery } = definitions;

/**
 * Gets many tasks
 *
 * @param {*} app
 */
exports.getMany = app => {
  app.get('/task', {
    schema: {
      description: 'Gets many tasks',
      tags: ['Task'],
      summary: 'Gets many tasks',
      query: GetManyTaskQuery,
      response: {
        200: GetManyTaskResponse
      }
    },
    /**
     * handles the request for a given route
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { query } = request;
      const { limit = 10, startDateCreated, endDateCreated, startDateUpdated, endDateUpdated } = query;

      if (parseInt(limit) > 50) {
        return response
          .code(400)
          .send({
            success: false,
            code: 'task/malformed',
            message: 'Query limit exceeded'
          });
      }

      const options = {};

      if (startDateCreated) {
        options.dateCreated = {};
        options.dateCreated.$gte = startDateCreated;
      }
      if (endDateCreated) {
        options.dateCreated = options.dateUpdated || {};
        options.dateCreated.$lte = endDateCreated;
      }
      if (startDateUpdated) {
        options.dateUpdated = options.dateUpdated || {};
        options.dateUpdated.$gte = startDateUpdated;
      }
      if (endDateUpdated) {
        options.dateUpdated = options.dateUpdated || {};
        options.dateUpdated.$lte = endDateUpdated;
      }

      const data = await Task
        .find(options)
        .limit(parseInt(limit))
        .sort({
          // this forces to start the query on startDate if and when
          // startDate only exists.
          dateUpdated: startDateUpdated && !endDateUpdated ? 1 : -1
        })
        .exec();

      // force sort to do a descending order
      if (startDateUpdated && !endDateUpdated) {
        data.sort((prev, next) => next.dateUpdated - prev.dateUpdated)
      }

    return {
      success: true,
      data
    };
  }
  });
};
  