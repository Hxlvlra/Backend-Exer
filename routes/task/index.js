const { create } = require('./create');
const { getMany } = require('./get-many');

/**
 * initialize all the routes for task
 *
 * @param {*} app
 */
exports.task = app => {
  create(app);
  getMany(app);
}
