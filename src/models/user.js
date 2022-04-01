require('dotenv').config()

const jwt = require('jsonwebtoken')

const ethUtil = require('ethereumjs-util')

var { recoverPersonalSignature } = require('eth-sig-util')

var bcrypt = require('bcryptjs')

var { initializeApp, applicationDefault } = require('firebase-admin/app')

var { getFirestore } = require('firebase-admin/firestore')

var Web3 = require('web3')

const Tx = require('ethereumjs-tx').Transaction
console.log(Tx)
var web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/8a6edb7f0a874064b463e7aec666ad0e',
  ),
)

initializeApp({
  credential: applicationDefault(),
})

const db = getFirestore()

class User {
  constructor(data) {
    this.address = data.address
    this.nonce = generateNonce()
  }

  async setUserRole() {
    this.role = await getRoleFromContract(this.address)
  }

  async toMap() {
    return {
      address: await hashData(this.address),
      role: this.role,
      nonce: this.nonce,
    }
  }
}

var createToken = (user) => {
  return jwt.sign(
    { address: user.address, role: user.role, nonce: user.nonce },
    '213213213213021211112345550',
    {
      expiresIn: 60000,
    },
  )
}

var hashData = async (data) => {
  return await bcrypt.hash(data, 10)
}

var getUser = async (user) => {
  var userDocs = (await db.collection('users').get()).docs
  for (doc of userDocs) {
    if (await bcrypt.compare(user.address, doc.get('address'))) return doc
  }
  return null
}

var userExists = async (user) => {
  return (await getUser(user)) != null
}

var registerUser = async (user) => {
  var userCollection = db.collection('users')
  if (!(await userExists(user))) {
    var userInstance = createUser(user)
    await userInstance.setUserRole()
    return {
      success: true,
      nonce: await (
        await (await userCollection.add(await userInstance.toMap())).get()
      ).get('nonce'),
    }
  }
  return { success: false }
}

var createUser = (userData) => {
  return new User(userData)
}

var generateNonce = () => Math.floor(Math.random() * 1000000)

var loginUser = async (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      var currentUser = await getUser(userData)
      const msg = `Signing nonce: ${currentUser.get('nonce')}`
      const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'))
      const address = recoverPersonalSignature({
        data: msgBufferHex,
        sig: userData.signature,
      })
      if (userData.address === address) {
        changeNonce(currentUser, generateNonce())
        var userInstance = createUser(userData)
        await userInstance.setUserRole()
        resolve(createToken(userInstance))
      }
    } catch (e) {
      resolve(null)
    }
  })
}

var changeNonce = async (doc, nonce) => await doc.ref.update({ nonce: nonce })

var getNonce = async (user) => {
  try {
    return (await getUser(user)).get('nonce')
  } catch (e) {
    return null
  }
}

var getRoleFromContract = async (userAddress) => {
  var contract = await new web3.eth.Contract(
    [
      {
        inputs: [],
        name: 'retrieve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'walletAddress',
            type: 'address',
          },
        ],
        name: 'setRole',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'walletAddress',
            type: 'address',
          },
        ],
        name: 'getUserRole',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    '0x4a4849d75f57ee0e1ae0b208e1132db1d70d1396',
  )

  /*var assign = sendSigned(txData, function (err, result) {
    if (err) return console.log('error', err)
    console.log('sent', result)
  })*/
  console.log('as', assign)
  //console.log(await contract.methods.setRole(userAddress))
  /*return await contract.methods.getUserRole(userAddress).call((err, res) => res) */
  return 'user'
}

const addressFrom = '0x412f2182BFBCd943821CE6908Ec456e9ef52e8fc'
const privKey =
  'aa1218d0dac36b4ae33041a8896a9c213987c782bd899538c80cf508daad5784'

// the destination address
const addressTo = '0x4a4849d75f57ee0e1ae0b208e1132db1d70d1396'

web3.eth.getTransactionCount(addressFrom).then((txCount) => {
  // construct the transaction data
  const txData = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(25000),
    gasPrice: web3.utils.toHex(10e9), // 10 Gwei
    to: addressTo,
    from: addressFrom,
    value: web3.utils.toHex(web3.utils.toWei('0', 'milliether')),
  }

  // fire away!
  sendSigned(txData, function (err, result) {
    if (err) return console.log('error', err)
    console.log('sent', result)
  })
})

// Signs the given transaction data and sends it. Abstracts some of the details
// of buffering and serializing the transaction for web3.
function sendSigned(txData, cb) {
  const privateKey = Buffer.from(privKey, 'hex')
  console.log(privateKey, 'Private key')
  const transaction = new Tx(txData, { chain: 'rinkeby' })
  transaction.sign(privateKey)
  console.log(transaction, 'Transaction')
  const serializedTx = transaction.serialize().toString('hex')
  console.log(serializedTx, 'Serialized')
  console.log(web3.eth.sendSignedTransaction('0x' + serializedTx, cb))
}

module.exports = {
  hashData: hashData,
  getUser: getUser,
  userExists: userExists,
  createUser: createUser,
  registerUser: registerUser,
  generateNonce: generateNonce,
  changeNonce: changeNonce,
  getNonce: getNonce,
  loginUser: loginUser,
  getRoleFromContract: getRoleFromContract,
}
