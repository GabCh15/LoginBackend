const {loginUser,getNonce} = require('../models/user.js')

const loginController = {
    loginResult: async (req, res) => {
      res.send({token:await loginUser(req.body)});
    },
    loginGetNonce: async (req, res) => {
        res.json({nonce: await getNonce(req.body)});
    }
  };
  module.exports = loginController;
  