const { create } = require('./create');
const { getMany } = require('./get-many');
const { get } = require('./get');

/**
 * initialize all the routes for task
 *
 * @param {*} app
 */
exports.task = app => {
  create(app);
  getMany(app);
  get(app);
}
