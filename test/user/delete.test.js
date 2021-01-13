const { mongoose, User } = require('../../db');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for deleting one task DELETE: (/task/:id)', () => {
  let app;
  let authorization = '';

  before(async () => {
    // initialize the backend applicaiton
    app = await build();
    await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'passerby',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'sometrialuser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'sometrialuser',
        password: 'password1234567890',
      }
    });
    const { data: token } = response.json();

    authorization = `Bearer ${token}`;

  });

  after(async () => {
    // clean up the database
    await User.findOneAndDelete({ username: 'sometrialuser' });
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true } and has a status code of 200 when called using DELETE', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/user/passerby}`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success } = payload;
    const username = 'passerby';

    success.should.equal(true);
    statusCode.should.equal(200);

    const user = await User
      .findOne({ username })
      .exec();

    should.not.exists(user);

  });

  it('it should return { success: false, message: error message } and has a status code of 404 when called using DELETE and the username is non-existing', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/user/non-existing-username`,
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
