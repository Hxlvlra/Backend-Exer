const { create } = require('./create');
const { getMany } = require('./get-many');
const { get } = require('./get');
const { update } = require('./update');

/**
 * initialize all the routes for task
 *
 * @param {*} app
 */
exports.task = app => {
  create(app);
  getMany(app);
  get(app);
  update(app);
}
