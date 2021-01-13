const { Task } = require('../../db');

/**
 * Gets many tasks
 *
 * @param {*} app
 */
exports.getMany = app => {
  /**
   * This gets the tasks from the database
   *
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply<Response>} response
   */
  app.get('/task', async (request, response) => {
    const { query } = request;
    const { limit = 10, startDateCreated, endDateCreated, startDateUpdated, endDateUpdated } = query;

    if (parseInt(limit) > 50) {
      return response
      .code(400)
      .send({
        success: false,
        code: 'task/malformed',
        message: 'Query Limit exceeds 50'
      });
    };

    // if there is are parameters, the query should search the corresponding property
    // if the property meets the criteria
    //
    // if there is no startDate, it will search for all given the limit
    const options = startDateCreated || endDateCreated || startDateUpdated || endDateUpdated
    ? startDateCreated 
        ? endDateCreated 
          ? startDateUpdated
            ? endDateUpdated
              ? {
                dateCreated: { $gte: startDateCreated },
                dateCreated: { $lte: endDateCreated },
                dateUpdated: { $gte: startDateUpdated },
                dateUpdated: { $lte: endDateUpdated }
              }
              : {
                dateCreated: { $gte: startDateCreated },
                dateCreated: { $lte: endDateCreated },
                dateUpdated: { $gte: startDateUpdated }
              }
           : endDateUpdated
            ? {
              dateCreated: { $gte: startDateCreated },
              dateCreated: { $lte: endDateCreated },
              dateUpdated: { $lte: endDateUpdated }
            }
            : {
              dateCreated: { $gte: startDateCreated },
              dateCreated: { $lte: endDateCreated }
             }
          : startDateUpdated
            ? endDateUpdated
              ? {
                dateCreated: { $gte: startDateCreated },
                dateUpdated: { $gte: startDateUpdated },
                dateUpdated: { $lte: endDateUpdated }
              }
              : {
                dateCreated: { $gte: startDateCreated },
                dateUpdated: { $gte: startDateUpdated }
              }
            : endDateUpdated
              ? {
                dateCreated: { $gte: startDateCreated },
                dateUpdated: { $lte: endDateUpdated }
              }
              : {
                dateCreated: { $gte: startDateCreated }
              }
    : endDateCreated 
      ? startDateUpdated
        ? endDateUpdated
          ? {
            dateCreated: { $lte: endDateCreated },
            dateUpdated: { $gte: startDateUpdated },
            dateUpdated: { $lte: endDateUpdated }
          }
          : {
            dateCreated: { $lte: endDateCreated },
            dateUpdated: { $gte: startDateUpdated }
          }
      : endDateUpdated
        ? {
          dateCreated: { $lte: endDateCreated },
          dateUpdated: { $lte: endDateUpdated }
        }
        : {
          dateCreated: { $lte: endDateCreated }
        }
      : startDateUpdated
        ? endDateUpdated
          ? {
            dateUpdated: { $gte: startDateUpdated },
            dateUpdated: { $lte: endDateUpdated }
          }
          : {
            dateUpdated: { $gte: startDateUpdated }
          }
        : {
          dateUpdated: { $lte: endDateUpdated }
        }
  : { };

  const data = await Task
    .find(options)
    .limit(parseInt(limit))
    .sort({
      dateUpdated: -1
    })
    .exec();

  return {
    success: true,
    data
  };
  });
};
  