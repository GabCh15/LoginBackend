const {loginUser,getNonce,getRoleFromContract} = require('../models/user.js')

const loginController = {
    loginResult:  async (req, res) => {
      res.send({token: await loginUser(req.body)});
    },
    loginGetNonce: async (req, res) => {
        res.json({nonce: await getNonce(req.body)});
    },
    loginGetRole: async (req, res) => {
      res.json({role: await getRoleFromContract(req.body.address)});
  }
  };
  module.exports = loginController;
  