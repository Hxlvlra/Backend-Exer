const { mongoose, User  } = require('../../db');
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
        username: 'alsoAUser',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'alsoAUser',
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
    await User.findOneAndDelete({ username: 'alsoAUser' });
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: user } and has a status code of 200 when called using GET', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/user/alsoAUser`,
      headers: {
        authorization
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;

    console.log (payload);

    const { username, firstName, lastName, isAdmin, dateCreated, dateUpdated } = data;

    success.should.equal(true);
    statusCode.should.equal(200);

    const user = await User
      .findOne({ username })
      .exec();

    username.should.equal(user.username);
    firstName.should.equal(user.firstName);
    isAdmin.should.equal(user.isAdmin);
    dateCreated.should.equal(user.dateCreated);
    lastName.should.equal(user.lastName);
    dateUpdated.should.equal(user.dateUpdated);
  });

  it('it should return { success: false, message: error message } and has a status code of 404 when called using GET and the username is non-existing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/user/non-existing-username`,
      headers: {
        authorization
      }
    });

    const payload = response.json();

    console.log (payload);

    const { statusCode } = response;
    const { code, message } = payload;

    statusCode.should.equal(404);
    should.exists(code);
    should.exists(message);
  });
});
