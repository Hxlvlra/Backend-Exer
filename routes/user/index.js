const { create } = require('./create');
const { login } = require('./login');
const { logout } = require('./logout');
const { auth } = require('./auth');
const { get } = require('./get');
const { getMany } = require('./get-many');
const { deleteOne } = require('./delete');
const { update } = require('./update');


/**
 * initialize all the routes for todo
 *
 * @param {*} app
 */
exports.user = app => {
  create(app);
  login(app);
  auth(app);
  logout(app);
  get(app);
  getMany(app);
  deleteOne(app);
  update(app);
}
