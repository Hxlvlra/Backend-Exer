const bcrypt = require('bcrypt');
const { User } = require('../../db');
const { definitions } = require('../../definitions');
const { GetOneUserResponse, PostUserRequest } = definitions;
const saltRounds = 10;

/**
 * this is the route for creating a user
 *
 * @param {*} app
 */
exports.create = app => {
  app.post('/user', {
    schema: {
      description: 'Create one user',
      tags: ['User'],
      summary: 'Create one user',
      body: PostUserRequest,
      response: {
        200: GetOneUserResponse
      }
    },
    /**
     * handles the request for a given route
     *
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply<Response>} response
     */
    handler: async (request, response) => {
      const { body } = request;
      const { username, password, firstName, lastName, isAdmin } = body;

      const user = await User.findOne({ username }).exec();
      
      if(user){
        return response
          .code(403)
          .send({
            success: false,
            code: 'forbidden',
            message: 'Username already exists'
          });
      }

      const hash = await bcrypt.hash(password, saltRounds);

      const data = new User({
        username,
        password: hash,
        firstName,
        lastName,
        isAdmin
      });

      await data.save();

      return {
        success: true,
        data
      }
    }
  })
};
