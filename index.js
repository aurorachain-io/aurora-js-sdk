'use strict'
const ethUtil = require('ethereumjs-util')
const fees = require('ethereum-common/params.json')
const BN = ethUtil.BN

// secp256k1n/2
const N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16)
var Wallet = require('ethereumjs-wallet');
var {bigNumberify} = require('ethers/utils/bignumber');
var RLP = require('ethers/utils/rlp');

/**
 * Creates a new transaction object.
 *
 * @example
 * var rawTx = {
 *   nonce: '0x00',
 *   gasPrice: '0x09184e72a000',
 *   gasLimit: '0x2710',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: '0x00',
 *   data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
 *   v: '0x1c',
 *   r: '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
 *   s: '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
 * };
 * var tx = new Transaction(rawTx);
 *
 * @class
 * @param {Buffer | Array | Object} data a transaction can be initiailized with either a buffer containing the RLP
 *   serialized transaction or an array of buffers relating to each of the tx Properties, listed in order below in the
 *   exmple.
 *
 * Or lastly an Object containing the Properties of the transaction like in the Usage example.
 *
 * For Object and Arrays each of the elements can either be a Buffer, a hex-prefixed (0x) String , Number, or an object
 *   with a toBuffer method such as Bignum
 *
 * @property {Buffer} raw The raw rlp encoded transaction
 * @param {Buffer} data.nonce nonce number
 * @param {Buffer} data.gasLimit transaction gas limit
 * @param {Buffer} data.gasPrice transaction gas price
 * @param {Buffer} data.to to the to address
 * @param {Buffer} data.value the amount of ether sent
 * @param {Buffer} data.data this will contain the data of the message or the init of a contract
 * @param {Buffer} data.value the amount of ether sent
 * @param {Buffer} data.v EC recovery ID
 * @param {Buffer} data.r EC signature parameter
 * @param {Buffer} data.s EC signature parameter
 * @param {Number} data.chainId EIP 155 chainId - mainnet: 1, ropsten: 3
 * */

class Transaction {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'nonce',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'gasPrice',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'gasLimit',
      alias: 'gas',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'to',
      allowZero: true,
      length: 20,
      default: new Buffer([])
    }, {
      name: 'value',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'data',
      alias: 'input',
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'action',
      length: 2,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'vote',
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'nickname',
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'asset',
      allowZero: true,
      length: 20,
      default: new Buffer([])
    }, {
      name: 'assetInfo',
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'subAddress',
      // length: 36,
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'abi',
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'v',
      allowZero: true,
      default: new Buffer([0x1b])
    }, {
      name: 'r',
      length: 32,
      allowZero: true,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 's',
      length: 32,
      allowZero: true,
      allowLess: true,
      default: new Buffer([])
    }]

    /**
     * Returns the rlp encoding of the transaction
     * @method serialize
     * @return {Buffer}
     * @memberof Transaction
     * @name serialize
     */
    // attached serialize
    ethUtil.defineProperties(this, fields, data)

    /**
     * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other
     *   parameters.
     * @name from
     * @memberof Transaction
     */
    Object.defineProperty(this, 'from', {
      enumerable: true,
      configurable: true,
      get: this.getSenderAddress.bind(this)
    })

    // calculate chainId from signature
    let sigV = ethUtil.bufferToInt(this.v)
    let chainId = Math.floor((sigV - 35) / 2)
    if (chainId < 0) chainId = 0

    // set chainId
    this._chainId = chainId || data.chainId || 0
    this._homestead = true
    this._subAddress = fields['subAddress']
  }

  /**
   * If the tx's `to` is to the creation address
   * @return {Boolean}
   */
  toCreationAddress () {
    return this.to.toString('hex') === ''
  }

  /**
   * Computes a sha3-256 hash of the serialized tx
   * @param {Boolean} [includeSignature=true] whether or not to inculde the signature
   * @return {Buffer}
   */
  hash (includeSignature, chainID) {
    if (includeSignature === undefined) includeSignature = true
    if (includeSignature && chainID) this.v = chainID;
    // EIP155 spec:
    // when computing the hash of a transaction for purposes of signing or recovering,
    // instead of hashing only the first six elements (ie. nonce, gasprice, startgas, to, value, data),
    // hash nine elements, with v replaced by CHAIN_ID, r = 0 and s = 0

    let items
    if (includeSignature) {
      items = this.raw
    } else {
      if (this._chainId > 0) {
        const raw = this.raw.slice()
        this.v = this._chainId
        this.r = 0
        this.s = 0
        items = this.raw
        this.raw = raw
      } else {
        items = this.raw.slice(0, 6)
      }
    }

    // create hash
    return ethUtil.rlphash(items)
  }

  /**
   * returns chain ID
   * @return {Buffer}
   */
  getChainId () {
    return this._chainId
  }

  /**
   * returns the sender's address
   * @return {Buffer}
   */
  getSenderAddress () {
    if (this._from) {
      return this._from
    }
    const pubkey = this.getSenderPublicKey()
    this._from = ethUtil.publicToAddress(pubkey)
    return this._from
  }

  /**
   * returns the public key of the sender
   * @return {Buffer}
   */
  getSenderPublicKey () {
    if (!this._senderPubKey || !this._senderPubKey.length) {
      if (!this.verifySignature()) throw new Error('Invalid Signature')
    }
    return this._senderPubKey
  }

  /**
   * Determines if the signature is valid
   * @return {Boolean}
   */
  verifySignature () {
    this._chainId = 1
    var items = [
      this.nonce,
      this.gasPrice,
      this.gasLimit,
      this.to,
      this.value,
      this.data,
      0,
      this.vote,
      this.nickname,
      this.asset,
      this.assetInfo,
      this._subAddress,
      this.abi,
      this._chainId,
      0,
      0
    ]
    const  msgHash = ethUtil.rlphash(items)
    // const msgHash = this.hash(true)
    // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
    if (this._homestead && new BN(this.s).cmp(N_DIV_2) === 1) {
      return false
    }

    try {
      let v = ethUtil.bufferToInt(this.v)
      if (this._chainId > 0) {
        v -= this._chainId * 2 + 8
      }
      this._senderPubKey = ethUtil.ecrecover(msgHash, v, this.r, this.s)
      console.log(this._senderPubKey)
    } catch (e) {
      return false
    }

    return !!this._senderPubKey
  }

  /**
   * sign a transaction with a given private key
   * @param {Buffer} privateKey
   */
  sign (privateKey, chainID) {
    const msgHash = this.hash(true, chainID)
    const sig = ethUtil.ecsign(msgHash, privateKey)

    if (chainID > 0) {
      sig.v += chainID * 2 + 8
    }
    Object.assign(this, sig)
  }

  /**
   * The amount of gas paid for the data in this tx
   * @return {BN}
   */
  getDataFee () {
    const data = this.raw[5]
    const cost = new BN(0)
    for (let i = 0; i < data.length; i++) {
      data[i] === 0 ? cost.iaddn(fees.txDataZeroGas.v) : cost.iaddn(fees.txDataNonZeroGas.v)
    }
    return cost
  }

  /**
   * the minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
   * @return {BN}
   */
  getBaseFee () {
    const fee = this.getDataFee().iaddn(fees.txGas.v)
    if (this._homestead && this.toCreationAddress()) {
      fee.iaddn(fees.txCreation.v)
    }
    return fee
  }

  /**
   * the up front amount that an account must have for this transaction to be valid
   * @return {BN}
   */
  getUpfrontCost () {
    return new BN(this.gasLimit)
      .imul(new BN(this.gasPrice))
      .iadd(new BN(this.value))
  }

  /**
   * validates the signature and checks to see if it has enough gas
   * @param {Boolean} [stringError=false] whether to return a string with a description of why the validation failed or
   *   return a Boolean
   * @return {Boolean|String}
   */
  validate (stringError) {
    const errors = []
    if (!this.verifySignature()) {
      errors.push('Invalid Signature')
    }

    if (this.getBaseFee().cmp(new BN(this.gasLimit)) > 0) {
      errors.push([`gas limit is too low. Need at least ${this.getBaseFee()}`])
    }

    if (stringError === undefined || stringError === false) {
      return errors.length === 0
    } else {
      return errors.join(' ')
    }
  }
}

// function EMtoHex(address) {
//   return address.replace(/^EM/, '0x')
// }
function AOAtoHex(address) {
  return address.replace(/^AOA/, '0x')
}
function HexToAOA(address) {
  return address.replace(/^0x/, 'AOA')
}

function verifyAddress(address) {
  address = address.toLowerCase()
  var reg=/(^aoa|0x)[0-9a-f]{40}[0-9a-z]{0,32}$/;   /*定义验证表达式*/
  return reg.test(address);
}

function generateAOAAddress() {
  const EthWallet = Wallet.generate();
  var address = EthWallet.getAddressString()
  address = address.replace(/^0x/, 'AOA')
  console.log("address: " + address);
  console.log("privateKey: " + EthWallet.getPrivateKeyString());
}

function hexToString(hex) {
  var arr = hex.split("")
  var out = ""
  for (var i = 0; i < arr.length / 2; i++) {
    var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
    var charValue = String.fromCharCode(tmp);
    out += charValue
  }
  return out
}


function decodeTx(raw_tx) {
  var decoded_tx = RLP.decode(raw_tx);
  var [
    raw_nonce,
    raw_gasPrice,
    raw_gasLimit,
    raw_to,
    raw_value,
    raw_data,
    raw_action,
    raw_vote,
    raw_nickname,
    raw_asset,
    raw_assetInfo,
    raw_subAddress,
    raw_abi,
    raw_v,
    raw_r,
    raw_s,
  ] = decoded_tx;
  let chainId = 1

  var subAddress = hexToString(raw_subAddress)
  let idx = subAddress.indexOf('AOA')
  subAddress = subAddress.substring(idx,subAddress.length)
  let sub = subAddress
  if (sub === '\u0000') {
    sub = '0x';
  }
  var items = [
    Buffer.from(raw_nonce.substring(2),'hex'),
    Buffer.from(raw_gasPrice.substring(2),'hex'),
    Buffer.from(raw_gasLimit.substring(2),'hex'),
    Buffer.from(raw_to.substring(2),'hex'),
    Buffer.from(raw_value.substring(2),'hex'),
    new Buffer(0),
    Buffer.from(raw_action.substring(2),'hex'),
    new Buffer(0),
    new Buffer(0),
    new Buffer(0),
    new Buffer(0),
    sub,
    new Buffer(0),
    chainId,
    0,
    0
  ]

  const  msgHash = ethUtil.rlphash(items)
  let v = bigNumberify(raw_v).toNumber()
  if (chainId > 0) {
    v -= chainId * 2 + 8
  }
  let senderPubKey = ethUtil.ecrecover(msgHash, v, Buffer.from(raw_r.substring(2),'hex'), Buffer.from(raw_s.substring(2),'hex'))
  let from = ethUtil.publicToAddress(senderPubKey)
  from = ethUtil.bufferToHex(from)
  from = HexToAOA(from)
  var transaction = {
    from: from,
    nonce: bigNumberify(raw_nonce).toNumber(),
    gasPrice: bigNumberify(raw_gasPrice),
    gasLimit: bigNumberify(raw_gasLimit),
    to: HexToAOA(raw_to),
    value: bigNumberify(raw_value),
    data: raw_data,
    v: bigNumberify(raw_v).toNumber(),
    r: raw_r,
    s: raw_s,
    action:raw_action,
    asset:raw_asset,
    subAddress:subAddress
  }

  if (transaction.to == '0x') delete transaction.to;
  return transaction;
}

exports.decodeTx = decodeTx
exports.hexToString = hexToString
exports.generateEMAddress = generateAOAAddress
exports.verifyAddress = verifyAddress
exports.HexToAOA = HexToAOA
exports.AOAtoHex = AOAtoHex

module.exports = {Transaction,HexToAOA: HexToAOA,AOAtoHex: AOAtoHex,decodeTx,hexToString,generateAOAAddress: generateAOAAddress,verifyAddress}

