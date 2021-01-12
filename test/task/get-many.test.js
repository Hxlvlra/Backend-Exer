const { getTasks } = require('../../lib/get-tasks');
const { delay } = require('../../lib/delay');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for getting many tasks GET: (/task)', () => {
  let app;
  const ids = [];
  const filename = join(__dirname, '../../database.json');
  const encoding = 'utf8';

  before(async () => {
    // initialize the backend applicaiton
    app = await build();

    for (let i = 0; i < 5; i++) {
      const response = await app.inject({
        method: 'POST',
        url: '/task',
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
    const tasks = getTasks(filename, encoding);
    for (const id of ids) {
      // find the index
      const index = tasks.findIndex(task => task.id === id);

      // delete the id
      if (index >= 0) {
        tasks.splice(index, 1);
      }

      writeFileSync(filename, JSON.stringify({ tasks }, null, 2), encoding);
    }
  });

  // happy path
  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task'
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    data.length.should.equal(10);

    const tasks = getTasks(filename, encoding);

    for (const task of data) {
      const { text, isDone, id } = task;
      const index = tasks.findIndex(task => task.id === id);
      index.should.not.equal(-1);
      const { text: textDatabase, isDone: isDoneDatabase } = tasks[index];
      text.should.equal(textDatabase);
      isDone.should.equal(isDoneDatabase);
    }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task'
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    data.length.should.equal(10);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTodo = data[i];
      const nextTodo = data[i + 1];

      (nextTodo.dateUpdated < prevTodo.dateUpdated).should.equal(true);
    }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the first item should be the latest updated item in the database', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/task'
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    data.length.should.equal(10);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTodo = data[i];
      const nextTodo = data[i + 1];

      (nextTodo.dateUpdated < prevTodo.dateUpdated).should.equal(true);
    }

    const tasks = getTasks(filename, encoding);

    // sort it in descending order
    tasks.sort((prev, next) => next.dateUpdated - prev.dateUpdated);

    const task = tasks[0];
    const responseTodo = data[0];

    task.id.should.equal(responseTodo.id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the last item is updated on or after startDateCreated', async () => {
    const tasks = getTasks(filename, encoding);
    const id = ids[parseInt(Math.random() * ids.length)];
    const index = tasks.findIndex(task => task.id === id);
    const { dateCreated: startDateCreated } = tasks[index];

    const response = await app.inject({
      method: 'GET',
      url: `/task?startDateCreated=${startDateCreated}`
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTodo = data[i];
      const nextTodo = data[i + 1];

      (nextTodo.dateCreated < prevTodo.dateCreated).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the last item is updated on or before startDateCreated', async () => {
    const tasks = getTasks(filename, encoding);
    const id = ids[parseInt(Math.random() * ids.length)];
    const index = tasks.findIndex(task => task.id === id);
    const { dateCreated: endDateCreated } = tasks[index];

    const response = await app.inject({
      method: 'GET',
      url: `/task?startDate=${endDateCreated}`
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTodo = data[i];
      const nextTodo = data[i + 1];

      (nextTodo.dateCreated < prevTodo.dateCreated).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the last item is updated on or after startDateUpdated', async () => {
    const tasks = getTasks(filename, encoding);
    const id = ids[parseInt(Math.random() * ids.length)];
    const index = tasks.findIndex(task => task.id === id);
    const { dateUpdated: startDateUpdated } = tasks[index];

    const response = await app.inject({
      method: 'GET',
      url: `/task?startDateUpdated=${startDateUpdated}`
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTodo = data[i];
      const nextTodo = data[i + 1];

      (nextTodo.dateUpdated < prevTodo.dateUpdated).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 items and it should be in descending order where the last item is updated on or before endDateUpdated', async () => {
    const tasks = getTasks(filename, encoding);
    const id = ids[parseInt(Math.random() * ids.length)];
    const index = tasks.findIndex(task => task.id === id);
    const { dateUpdated: endDateUpdated } = tasks[index];

    const response = await app.inject({
      method: 'GET',
      url: `/task?endDateUpdated=${endDateUpdated}`
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    success.should.equal(true);
    statusCode.should.equal(200);
    (data.length <= 10).should.equal(true);

    for (let i = 0; i < data.length - 1; i++) {
      const prevTodo = data[i];
      const nextTodo = data[i + 1];

      (nextTodo.dateUpdated < prevTodo.dateUpdated).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });
});
