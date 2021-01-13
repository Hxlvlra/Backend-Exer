const { mongoose, Task, User  } = require('../../db');
const { build } = require('../../app');
require('tap').mochaGlobals();
const should = require('should');

describe('For the route for creating a task POST: (/task)', () => {
  let app;
  let authorization = '';
  const ids = [];

  before(async () => {
    // initialize the backend applicaiton
    app = await build();

    await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'mockuser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'mockuser',
        password: 'password1234567890',
      }
    });
    const { data: token } = response.json();

    authorization = `Bearer ${token}`;
  });

  after(async () => {
    // clean up the database
    for (const id of ids) {
      await Task.findOneAndDelete({ id });
    }
    await User.findOneAndDelete({ username: 'mockuser' });

    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: (new task object) } and has a status code of 200 when called using POST', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/task',
      headers: {
        authorization
      },
      payload: {
        text: 'This is a task',
        isDone: false
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { text, isDone, id } = data;

    success.should.equal(true);
    statusCode.should.equal(200);
    text.should.equal('This is a task');
    isDone.should.equal(false);

    const {
      text: textDatabase,
      isDone: isDoneDatabase
    } = await Task
      .findOne({ id })
      .exec();
    text.should.equal(textDatabase);
    isDone.should.equal(isDoneDatabase);

    // add the id in the ids array for cleaning
    ids.push(id);
  });

  // another happy path but a different way of sending data.
  it('it should return { success: true, data: (new task object) } and has a status code of 200 when called using POST even if we don\'t provide the isDone property. Default of isDone should still be false', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/task',
      headers: {
        authorization
      },
      payload: {
        text: 'This is a task 2'
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { text, isDone, id } = data;

    success.should.equal(true);
    statusCode.should.equal(200);
    text.should.equal('This is a task 2');
    isDone.should.equal(false);

    const {
      text: textDatabase,
      isDone: isDoneDatabase
    } = await Task
      .findOne({ id })
      .exec();
    text.should.equal(textDatabase);
    isDone.should.equal(isDoneDatabase);

    // add the id in the ids array for cleaning
    ids.push(id);
  });

  // non-happy path
  it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/task',
      headers: {
        authorization
      },
      payload: {
        isDone: true
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, message } = payload;

    statusCode.should.equal(400);
    success.should.equal(false);
    should.exist(message);
  })

  // another non-happy
  it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/task',
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, message } = payload;

    statusCode.should.equal(400);
    success.should.equal(false);
    should.exist(message);
  })
});
