const { getTasks } = require('../../lib/get-tasks');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { build } = require('../../app');
require('tap').mochaGlobals();
const should = require('should');

describe('For the route for creating a task POST: (/task)', () => {
  let app;
  const ids = [];
  const filename = join(__dirname, '../../database.json');
  const encoding = 'utf8';

  before(async () => {
    // initialize the backend applicaiton
    app = await build();
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

  it('it should return { success: true, data: (new task object) } and has a status code of 200 when called using POST', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/task',
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

    const tasks = getTasks(filename, encoding);
    const index = tasks.findIndex(task => task.id === id);
    index.should.not.equal(-1);
    const { text: textDatabase, isDone: isDoneDatabase } = tasks[index];
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
    //isDone.should.equal(false);

    const tasks = getTasks(filename, encoding);
    const index = tasks.findIndex(task => task.id === id);
    index.should.not.equal(-1);
    const { text: textDatabase, isDone: isDoneDatabase } = tasks[index];
    text.should.equal(textDatabase);
    isDone.should.equal(isDoneDatabase);

    // add the id in the ids array for cleaning
    ids.push(id);
  });
});
