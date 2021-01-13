const { mongoose, User  } = require('../../db');
const { build } = require('../../app');
require('should');
require('tap').mochaGlobals();

describe('For the route for getting many Users GET: (/user)', () => {
  let app;
  let authorization = '';
  const usernames = [];

  before(async () => {
    // initialize the backend application

    app = await build();

    for (let i = 0; i < 11; i++) {
      const response = await app.inject({
        method: 'POST',
        url: '/user',
        payload: {
          username: `User ${i}`,
          password: 'password1234567890',
          firstName: 'Mock',
          lastName: 'Name'
        }
      });

      const payload = response.json();
      const { data } = payload;
      const { username } = data;

      usernames.push(username);
      await delay(1000);
    }

    await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'somedude',
        password: 'password1234567890',
        firstName: 'Mock',
        lastName: 'Name'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'somedude',
        password: 'password1234567890',
      }
    });
    const { data: token } = response.json();

    authorization = `Bearer ${token}`;

  });

  after(async () => {
    // clean up the database
    for (const username of usernames) {
      await User.findOneAndDelete({ username });
    }
    await User.findOneAndDelete({ username: 'somedude' });
    await mongoose.connection.close();
  });

  // happy path
  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/user',
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

    for (const user of data) {
      const { username, isAdmin, dateCreated, dateUpdated } = user;
      const {
        isAdmin: isAdminDatabase,
        dateCreated: dateCreatedDatabase,
        dateUpdated: dateUpdatedDatabase,
      } = await Task
        .findOne({ username })
        .exec();

      isAdmin.should.equal(isAdminDatabase);
      dateCreated.should.equal(dateCreatedDatabase);
      dateUpdated.should.equal(dateUpdatedDatabase);
      }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a limit of 7 users', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/user?limit=7',
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

    for (const user of data) {
      const { username, isAdmin, dateCreated, dateUpdated } = user;
      const {
        isAdmin: isAdminDatabase,
        dateCreated: dateCreatedDatabase,
        dateUpdated: dateUpdatedDatabase,
      } = await Task
        .findOne({ username })
        .exec();

      isAdmin.should.equal(isAdminDatabase);
      dateCreated.should.equal(dateCreatedDatabase);
      dateUpdated.should.equal(dateUpdatedDatabase);
     }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in alphabetical order', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/user',
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.username < nextUser.username).should.equal(true);
    }
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the first user should be the latest updated user in the database', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/user',
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.username < nextUser.username).should.equal(true);
    }

    const users = await Task
      .find()
      .limit(10)
      .sort({
        username: -1
      })
      .exec();

    const user = users[0];
    const responseUser = data[0];

    user.username.should.equal(responseUser.id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the last user is updated on or after startDateCreated', async () => {
    const username = usernames[parseInt(Math.random() * usernames.length)];
    const { dateCreated: startDateCreated } = await Task
      .findOne({ username })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/user?startDateCreated=${startDateCreated}`,
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.dateCreated < nextUser.dateCreated).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the fisrt user is updated on or before endDateCreated', async () => {
    const username = usernames[parseInt(Math.random() * usernames.length)];
    const { dateUpdated: endDateCreated } = await Task
      .findOne({ username })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/user?endDateCreated=${endDateCreated}`,
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.dateCreated < nextUser.dateCreated).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the last user is updated on or after startDateUpdated', async () => {
    const username = usernames[parseInt(Math.random() * usernames.length)];
    const { dateUpdated: startDateUpdated } = await Task
      .findOne({ username })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/user?startDateUpdated=${startDateUpdated}`,
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.dateUpdated < nextUser.dateUpdated).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the first user is updated on or before endDateUpdated', async () => {
    const username = usernames[parseInt(Math.random() * usernames.length)];
    const { dateUpdated: endDateUpdated } = await Task
      .findOne({ username })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/user?endDateUpdated=${endDateUpdated}`,
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.dateUpdated < nextUser.dateUpdated).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the first user is the last alphabetically', async () => {
    const username = usernames[parseInt(Math.random() * usernames.length)];
    const { username: startUsername } = await Task
      .findOne({ username })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/user?startUsername=${startUsername}`,
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.username < nextUser.username).should.equal(true);
    }

    // the last data should be equal to the picked id
    data[data.length - 1].id.should.equal(id);
  });

  it('it should return { success: true, data: array of tasks } and has a status code of 200 when called using GET and has a default limit of 10 users and it should be in descending order where the first user is the first alphabetically', async () => {
    const username = usernames[parseInt(Math.random() * usernames.length)];
    const { username: endUsername } = await Task
      .findOne({ username })
      .exec();

    const response = await app.inject({
      method: 'GET',
      url: `/user?endUsername=${endUsername}`,
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
      const prevUser = data[i];
      const nextUser = data[i + 1];

      (prevUser.username < nextUser.username).should.equal(true);
    }

    // the first data should be equal to the picked id
    data[0].id.should.equal(id);
  });

  // non happy path
  it('it should return { success: false, data: message } and has a status code of 400 when called using GET and the limit is 51 users', async () => {
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