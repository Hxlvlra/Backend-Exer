const { mongoose, User  } = require('../../db');
const { delay } = require('../../lib/delay');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for updating one user PUT: (/user/:id)', () => {
  let app;
  let authorization = '';

  before(async () => {
    // initialize the backend applicaiton
    app = await build();
    await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'testeduser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'testinguser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'testinguser',
        password: 'password1234567890',
      }
    });
    const { data: token } = response.json();

    authorization = `Bearer ${token}`;
  });

  after(async () => {
    // clean up the database
    await Task.findOneAndDelete({ username: 'testeduser' });
    await User.findOneAndDelete({ username: 'testinguser' });
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: task } and has a status code of 200 when called using PUT and updates the user', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/user/testeduser`,
        headers: {
        authorization
      },
      payload: {
        firstName: "newname"
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { text, id, isDone } = data;

    success.should.equal(true);
    statusCode.should.equal(200);

    const task = await Task
      .findOne({ id })
      .exec();

    text.should.equal('New Task');
    isDone.should.equal(true);

    text.should.equal(task.text);
    isDone.should.equal(task.isDone);
    id.should.equal(task.id);
  });

  it('it should return { success: true, data: task } and has a status code of 200 when called using PUT and updates the text item only', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/task/${ids[2]}`,
      headers: {
        authorization
      },
      payload: {
        text: 'New Taskmaster'
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { text, id, isDone } = data;

    success.should.equal(true);
    statusCode.should.equal(200);

    const task = await Task
      .findOne({ id })
      .exec();

    text.should.equal('New Taskmaster');
    isDone.should.equal(false);

    text.should.equal(task.text);
    isDone.should.equal(task.isDone);
    id.should.equal(task.id);
  });

  it('it should return { success: true, data: task } and has a status code of 200 when called using PUT and updates the isDone item only', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/task/${ids[4]}`,
      headers: {
        authorization
      },
      payload: {
        isDone: true
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { text, id, isDone } = data;

    success.should.equal(true);
    statusCode.should.equal(200);

    const task = await Task
      .findOne({ id })
      .exec();

    isDone.should.equal(true);

    text.should.equal(task.text);
    isDone.should.equal(task.isDone);
    id.should.equal(task.id);
  });

  //non happy path
  it('it should return { success: false, message: error message } and has a status code of 404 when called using PUT and the username is non-existing', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/user/non-existing-id`,
      headers: {
        authorization
      },
      payload: {
        firstName: 'newName'
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, code, message } = payload;

    success.should.equal(false);
    statusCode.should.equal(404);

    should.exists(code);
    should.exists(message);
  });

  it('it should return { success: false, message: error message } and has a status code of 400 when called using PUT and we didn\'t put a payload', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/user/testeduser}`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { code, message } = payload;

    statusCode.should.equal(400);
    should.exists(code);
    should.exists(message);
  });

  it('it should return { success: false, message: error message } and has a status code of 400 when called using PUT and we put a payload without text or isDone property', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/user/testeduser}`,
      headers: {
        authorization
      },
      payload: {}
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, code, message } = payload;

    success.should.equal(false);
    statusCode.should.equal(400);

    should.exists(code);
    should.exists(message);
  });
});
