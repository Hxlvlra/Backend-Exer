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
   */
  app.get('/task', () => {
    const encoding = 'utf8';
    const filename = join(__dirname, '../../database.json');
    const tasks = getTasks(filename, encoding);
    const data = [];

    for (const task of tasks) {
      data.push(task);
    }

    return {
      success: true,
      data
    };
  });
};
