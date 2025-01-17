const { mongoose, Task, User  } = require('../../db');
const { delay } = require('../../lib/delay');
const { build } = require('../../app');
require('should');
require('tap').mochaGlobals();

describe('For the route for getting many tasks GET: (/task)', () => {
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
        username: 'maybeuser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'maybeuser',
        password: 'password1234567890',
      }
    });
    const { data: token } = response.json();

    authorization = `Bearer ${token}`;

    for (let i = 0; i < 11; i++) {
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
    await User.findOneAndDelete({ username: 'maybeuser' });
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task',
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (const task of data) {
      const { text, isDone, id } = task;
      const {
        text: textDatabase,
        isDone: isDoneDatabase
      } = await Task
        .findOne({ id })
        .exec();

      text.should.equal(textDatabase);
      isDone.should.equal(isDoneDatabase);
    }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a limit of 7 items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task?limit=7',
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 7).should.equal(true);

    for (const task of data) {
      const { text, isDone, id } = task;
      const {
        text: textDatabase,
        isDone: isDoneDatabase
      } = await Task
        .findOne({ id })
        .limit(7)
        .exec();
      text.should.equal(textDatabase);
      isDone.should.equal(isDoneDatabase);
    }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task',
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTask = data[i];
      const nextTask = data[i + 1];

      (nextTask.dateUpdated < prevTask.dateUpdated).should.equal(true);
    }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the first item should be the latest updated item in the database', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task',
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTask = data[i];
      const nextTask = data[i + 1];

      (nextTask.dateUpdated < prevTask.dateUpdated).should.equal(true);
    }

    const tasks = await Task
      .find()
      .limit(10)
      .sort({
        dateUpdated: -1
      })
      .exec();

    const task = tasks[0];
    const responseTask = data[0];

    task.id.should.equal(responseTask.id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the last item is updated on or after startDateCreated', async () => {
    const id = ids[parseInt(Math.random() * ids.length)];
    const { dateCreated: startDateCreated } = await Task
      .findOne({ id })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/task?startDateCreated=${startDateCreated}`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTask = data[i];
      const nextTask = data[i + 1];

      (nextTask.dateCreated < prevTask.dateCreated).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the fisrt item is updated on or before endDateCreated', async () => {
    const id = ids[parseInt(Math.random() * ids.length)];
    const { dateCreated: endDateCreated } = await Task
      .findOne({ id })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/task?endDateCreated=${endDateCreated}`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTask = data[i];
      const nextTask = data[i + 1];

      (nextTask.dateCreated < prevTask.dateCreated).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the last item is updated on or after startDateUpdated', async () => {
    const id = ids[parseInt(Math.random() * ids.length)];
    const { dateUpdated: startDateUpdated } = await Task
      .findOne({ id })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/task?startDateUpdated=${startDateUpdated}`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTask = data[i];
      const nextTask = data[i + 1];

      (nextTask.dateUpdated < prevTask.dateUpdated).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the first item is updated on or before endDateUpdated', async () => {
    const id = ids[parseInt(Math.random() * ids.length)];
    const { dateUpdated: endDateUpdated } = await Task
      .findOne({ id })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/task?endDateUpdated=${endDateUpdated}`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTask = data[i];
      const nextTask = data[i + 1];

      (nextTask.dateUpdated < prevTask.dateUpdated).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });


  // non happy path
  it('it should return { success: false, data: message } and has a status code of 400 when called using GET and the limit is 51 items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task?limit=51',
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
  });
  
});