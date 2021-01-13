const { mongoose, User } = require('../../db');
const { build } = require('../../app');
const should = require('should');
require('tap').mochaGlobals();

describe('For the route for creating a user POST: (/user)', () => {
  let app;
  const usernames = [];

  before(async () => {
    // initialize the backend applicaiton
    app = await build();
  });

  after(async () => {
    // clean up the database
    for (const username of usernames) {
      await User.findOneAndDelete({ username });
    }
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: (new user object) } and has a status code of 200 when called using POST', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'user0000',
        password: 'asdqwfgvbszsa',
        firstName: 'FName',
        lastName: 'LName'
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, data } = payload;
    const { username } = data;

    success.should.equal(true);
    statusCode.should.equal(200);
    username.should.equal('user0000');

    const {
      username: usernameDatabase
    } = await User
      .findOne({ username })
      .exec();

    username.should.equal(usernameDatabase);

    // add the id in the ids array for cleaning
    usernames.push(username);
  });

  // non-happy path
  it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no username', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        password: 'qqqqqqqqqqqq',
        firstName: 'FName',
        lastName: 'LName'
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, message } = payload;

    statusCode.should.equal(400);
    should.exist(message);
  })

    // non-happy path
    it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and username is already in use', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user',
        payload: {
          username: 'hxlvlra',
          password: 'qqqqqqqqqqqq',
          firstName: 'FName',
          lastName: 'LName'
        }
      });
  
      const payload = response.json();
      const { statusCode } = response;
      const { success, message } = payload;
  
      statusCode.should.equal(403);
      should.exist(message);
    })

  // non-happy path
  it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'useraaaaaaaaa',
        firstName: 'FName',
        lastName: 'LName'
      }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, message } = payload;

    statusCode.should.equal(400);
    should.exist(message);
  })

  // non-happy path
  it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no first name', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'userwwwwwww',
        password: 'wwwwwwwwwwwww',
        lastName: 'LName'
        }
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, message } = payload;

    statusCode.should.equal(400);
    should.exist(message);
  })

    // non-happy path
    it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no last name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user',
        payload: {
          username: 'user0000',
          password: 'asdqwfgvbszsa',
          firstName: 'FName',
          }
      });
  
      const payload = response.json();
      const { statusCode } = response;
      const { success, message } = payload;
  
      statusCode.should.equal(400);
      should.exist(message);
    })
  
  // another non-happy
  it('it should return { success: false, message: error message } and has a status code of 400 when called using POST and there is no payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/user'
    });

    const payload = response.json();
    const { statusCode } = response;
    const { success, message } = payload;

    statusCode.should.equal(400);
    should.exist(message);
  })
});