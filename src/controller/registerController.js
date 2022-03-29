const {registerUser} = require('../models/user.js')

const registerController = {
    registerResult: async (req, res) => {
      res.send(await registerUser(req.body));
    },
  };
  module.exports = registerController;
  