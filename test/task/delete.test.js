const { getTasks } = require('../../lib/get-tasks');
const { delay } = require('../../lib/delay');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for deleting one task DELETE: (/task/:id)', () => {
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
  it('it should return { success: true } and has a status code of 200 when called using DELETE', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/task/${ids[0]}`
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success } = payload;
    const id = ids[0];

    success.should.equal(true);
    statusCode.should.equal(200);

    const tasks = getTasks(filename, encoding);
    const index = tasks.findIndex(task => task.id === id);
    index.should.equal(-1);
  });

  it('it should return { success: false, message: error message } and has a status code of 404 when called using DELETE and the id of the task is non-existing', async () => {
    const response = await app.inject({
      method: 'DELETE',
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
