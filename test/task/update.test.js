const { getTasks } = require('../../lib/get-tasks');
const { delay } = require('../../lib/delay');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for updating one task PUT: (/task/:id)', () => {
  let app;
  const ids = [];
  const filename = join(__dirname, '../../database.json');
  const encoding = 'utf8';

  before(async () => {
    // initialize the backend applicaiton
    app = await build();

    for (let i = 0; i < 7; i++) {
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
  it('it should return { success: true, data: task } and has a status code of 200 when called using PUT and updates the item', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/task/${ids[0]}`,
      payload: {
        text: 'New Task',
        isDone: true
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { text, id, isDone } = data;

    success.should.equal(true);
    statusCode.should.equal(200);

    const tasks = getTasks(filename, encoding);
    const index = tasks.findIndex(task => task.id === id);
    const task = tasks[index];

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

    const tasks = getTasks(filename, encoding);
    const index = tasks.findIndex(task => task.id === id);
    const task = tasks[index];

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

    const tasks = getTasks(filename, encoding);
    const index = tasks.findIndex(task => task.id === id);
    const task = tasks[index];

    isDone.should.equal(true);

    text.should.equal(task.text);
    isDone.should.equal(task.isDone);
    id.should.equal(task.id);
  });

  it('it should return { success: false, message: error message } and has a status code of 404 when called using PUT and the id of the task is non-existing', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/task/non-existing-id`,
      payload: {
        text: 'New Text for Task',
        isDone: true
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
      url: `/task/${ids[6]}`
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, code, message } = payload;

    success.should.equal(false);
    statusCode.should.equal(400);

    should.exists(code);
    should.exists(message);
  });

  it('it should return { success: false, message: error message } and has a status code of 400 when called using PUT and we put a payload without text or isDone property', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/task/${ids[1]}`,
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
