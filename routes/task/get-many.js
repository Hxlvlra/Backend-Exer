const { getTasks } = require('../../lib/get-tasks');
const { join } = require('path');

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
   */
  app.get('/task', (request) => {
    const { query } = request;
    const { limit = 10, startDateCreated, endDateCreated, startDateUpdated, endDateUpdated } = query;
    const encoding = 'utf8';
    const filename = join(__dirname, '../../database.json');
    const tasks = getTasks(filename, encoding);
    const data = [];

    if (limit > 50) {
      return response
        .code(400)
        .send({
          success: false,
          code: 'task/malformed',
          message: 'Query limit exceeds 50'
        });
    }

    if (!startDateCreated || !endDateCreated) {
      // if there is no startDate, we should sort the todos in a
      // descending order based on dateUpdated
      tasks.sort((prev, next) => next.dateUpdated - prev.dateUpdated);
    } else {
      // sorts the todos in an ascending order based on dateCreated
      tasks.sort((prev, next) => next.dateCreated - prev.dateCreated);
    }

    // if there are no pagination asked, we sort the tasks in a
    // descending order based on dateUpdated
    // else, check if the task completes the pagination requirement
    for (const task of tasks) {
      if (data.length < limit) {
        if (!startDateCreated && !endDateCreated && !startDateUpdated && !endDateUpdated) {
          data.push(task);
        } else if(!startDateCreated && !endDateCreated && !startDateUpdated && endDateUpdated >= task.dateUpdated){
          data.push(task);
        } else if(!startDateCreated && !endDateCreated && startDateUpdated <= task.dateUpdated && !endDateUpdated){
          data.push(task);
        } else if(!startDateCreated && endDateCreated >= task.dateCreated && !startDateUpdated && !endDateUpdated){
          data.push(task);
        } else if(!startDateCreated && !endDateCreated && startDateUpdated <= task.dateUpdated && endDateUpdated >= task.dateUpdated){
          data.push(task);
        } else if(!startDateCreated && endDateCreated >= task.dateCreated && startDateUpdated <= task.dateUpdated && !endDateUpdated){
          data.push(task);
        } else if(!startDateCreated && endDateCreated >= task.dateCreated && !startDateUpdated && endDateUpdated >= task.dateUpdated){
          data.push(task);
        } else if(!startDateCreated && endDateCreated >= task.dateCreated && startDateUpdated <= task.dateUpdate && endDateUpdated >= task.dateUpdated){
          data.push(task);
        } else if (startDateCreated <= task.dateCreated){
          if (!endDateCreated && !startDateUpdated && !endDateUpdated) {
            data.push(task);
          } else if(!endDateCreated && !startDateUpdated && endDateUpdated >= task.dateUpdated){
            data.push(task);
          } else if(!endDateCreated && startDateUpdated <= task.dateUpdated && !endDateUpdated){
            data.push(task);
          } else if(endDateCreated >= task.dateCreated && !startDateUpdated && !endDateUpdated){
            data.push(task);
          } else if(!endDateCreated && startDateUpdated <= task.dateUpdated && endDateUpdated >= task.dateUpdated){
            data.push(task);
          } else if(endDateCreated >= task.dateCreated && startDateUpdated <= task.dateUpdated && !endDateUpdated){
            data.push(task);
          } else if(endDateCreated >= task.dateCreated && !startDateUpdated && endDateUpdated >= task.dateUpdated){
            data.push(task);
          } else if (endDateCreated >= task.dateCreated && startDateUpdated <= task.dateUpdate && endDateUpdated >= task.dateUpdated){
            data.push(task);
          }
        }
      }
    }

    // if we want to sort it in a descending order, 
    // we should put next first and subtract it with the previous.
    data.sort((prev, next) => next.dateUpdated - prev.dateUpdated);

    return {
      success: true,
      data
    };
  });
};
  