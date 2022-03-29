require("dotenv").config();

const ethUtil = require("ethereumjs-util");

var { recoverPersonalSignature } = require("eth-sig-util");

var bcrypt = require("bcryptjs");

var { initializeApp, applicationDefault } = require("firebase-admin/app");

var { getFirestore } = require("firebase-admin/firestore");

var Web3 = require("web3");

var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/8a6edb7f0a874064b463e7aec666ad0e"
  )
);

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

class User {
  constructor(data) {
    this.address = data.address;
    this.nounce = generateNonce();
    this.role = "user";
  }
  async toMap() {
    return {
      address:( await hashData(this.address)).toLowerCase(),
      role: this.role,
      nonce: this.nounce,
    };
  }
}

var hashData = async (data) => {
  return await bcrypt.hash(data, 10);
};

var getUser = async (user) => {
  var userDocs = (await db.collection("users").get()).docs;
  for (doc of userDocs) {
    if (await bcrypt.compare(user.address.toLowerCase(), doc.get("address"))) return doc;
  }
  return null;
};

var userExists = async (user) => {
  return (await getUser(user)) != null;
};

var registerUser = async (user) => {
  var userCollection = db.collection("users");
  if (!(await userExists(user))) {
    return {
      success: true,
      nonce: await (
        await (await userCollection.add(await createUser(user).toMap())).get()
      ).get("nonce"),
    };
  }
  return { success: false };
};

var createUser = (userData) => {
  return new User(userData);
};

var generateNonce = () => Math.floor(Math.random() * 1000000);

var loginUser = async (userData) => {
  return new Promise(async (resolve, reject) => {
    var currentUser = await getUser(userData);
    const msg = `Signing nonce: ${currentUser.get("nonce")}`;
    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: userData.signature,
    });
    console.log(userData.address, address)
    if (userData.address.toLowerCase() === address.toLowerCase()) {
      changeNonce(currentUser, generateNonce());
    }
  });
};

var changeNonce = async (doc, nonce) =>
  await doc.ref.update({ nonce: nonce });

var getNonce = async (user) => {
  console.log(user)
  return (await getUser(user)).ref.get("nonce")}


module.exports = {
  hashData: hashData,
  getUser: getUser,
  userExists: userExists,
  createUser: createUser,
  registerUser: registerUser,
  generateNonce: generateNonce,
  changeNonce: changeNonce,
  getNonce:getNonce,
  loginUser: loginUser,
};
