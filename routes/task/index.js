const { create } = require('./create');

/**
 * initialize all the routes for task
 *
 * @param {*} app
 */
exports.task = app => {
  create(app);
}
