const { mongoose, Task, User  } = require('../../db');
const { delay } = require('../../lib/delay');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for getting one task GET: (/task/:id)', () => {
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
        username: 'notauser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'notauser',
        password: 'password1234567890',
      }
    });
    const { data: token } = response.json();

    authorization = `Bearer ${token}`;

    for (let i = 0; i < 1; i++) {
      const response = await app.inject({
        method: 'POST',
        url: '/task',
        headers: {
          authorization
        },
        payload: {
          text: `Task ${i}`,
          isDone: false
        }
      });

      const payload = response.json();
      const { data } = payload;
      const { id } = data;

      ids.push(id);
      await delay(1000);
    }
  });

  after(async () => {
    // clean up the database
    for (const id of ids) {
      await Task.findOneAndDelete({ id });
    }
    await User.findOneAndDelete({ username: 'notauser' });
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: task } and has a status code of 200 when called using GET', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/task/${ids[0]}`,
      headers: {
        authorization
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

    text.should.equal(task.text);
    isDone.should.equal(task.isDone);
    id.should.equal(task.id);
  });

  it('it should return { success: false, message: error message } and has a status code of 404 when called using GET and the id of the task is non-existing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/task/non-existing-id`,
      headers: {
        authorization
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
});
