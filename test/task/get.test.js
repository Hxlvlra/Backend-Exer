const { getTasks } = require('../../lib/get-tasks');
const { delay } = require('../../lib/delay');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for getting one task GET: (/task/:id)', () => {
  let app;
  const ids = [];
  const filename = join(__dirname, '../../database.json');
  const encoding = 'utf8';

  before(async () => {
    // initialize the backend applicaiton
    app = await build();

    for (let i = 0; i < 1; i++) {
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
  it('it should return { success: true, data: task } and has a status code of 200 when called using GET', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/task/${ids[0]}`
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

    text.should.equal(task.text);
    isDone.should.equal(task.isDone);
    id.should.equal(task.id);
  });

  it('it should return { success: false, message: error message } and has a status code of 404 when called using GET and the id of the task is non-existing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/task/non-existing-id`
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
