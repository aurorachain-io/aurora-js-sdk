// see full article here https://wanderer.github.io/ethereum/2014/06/14/creating-and-verifying-transaction-with-node/

// var Transaction = require('../index.js')
var {bigNumberify} = require('ethers/utils/bignumber');
var RLP = require('ethers/utils/rlp');
const ethUtil = require('ethereumjs-util')
let {Transaction,decodeTx,AOAtoHex,verifyAddress,HexToAOA,generateAOAAddress,hexToString} = require('../index.js')
//
// function AOAtoHex(address) {
//     return address.replace(/^AOA/, '0x')
// }
//
// function HexToAOA(address) {
//     return address.replace(/^0x/, 'AOA')
// }

// // 校验aoa地址是否合法
// function verifyAddress(address) {
//     address = address.toLowerCase()
//     var reg=/(^aoa|0x)[0-9a-f]{40}[0-9a-z]{0,32}$/;   /*定义验证表达式*/
//     return reg.test(address);
// }

// var Wallet = require('ethereumjs-wallet');
// function generateAOAAddress() {
//     const EthWallet = Wallet.generate();
//     var address = EthWallet.getAddressString()
//     address = address.replace(/^0x/, 'AOA')
//     console.log("address: " + address);
//     console.log("privateKey: " + EthWallet.getPrivateKeyString());
// }


// create a blank transaction
// var tx = new Transaction(null, 1) // mainnet Tx EIP155

// So now we have created a blank transaction but Its not quiet valid yet. We
// need to add some things to it. Lets start:
// notice we don't set the `to` field because we are creating a new contract.
// tx.nonce = 0
// tx.gasPrice = 100
// tx.gasLimit = 1000
// tx.value = 0
// tx.data = '0x7f4e616d65526567000000000000000000000000000000000000000000000000003057307f4e616d6552656700000000000000000000000000000000000000000000000000573360455760415160566000396000f20036602259604556330e0f600f5933ff33560f601e5960003356576000335700604158600035560f602b590033560f60365960003356573360003557600035335700'
// tx.action = 0

// tx.to = EMtoHex('AOA140e0b100bc3c5820a5d5ed3cf94d54491f51a2f')
// tx.asset = 'AOA140e0b100bc3c5820a5d5ed3cf94d54491f51a2f'.replace('AOA', '0x')
// tx.subAddress = EMtoHex('AOA140e0b100bc3c5820a5d5ed3cf94d54491f51a2fb590033560f603659600033565733600')

// function hexToString(hex) {
//   var arr = hex.split("")
//   var out = ""
//   for (var i = 0; i < arr.length / 2; i++) {
//     var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
//     var charValue = String.fromCharCode(tmp);
//     out += charValue
//   }
//   return out
// }


// function decodeTx(raw_tx) {
//     var decoded_tx = RLP.decode(raw_tx);
//     var [
//         raw_nonce,
//         raw_gasPrice,
//         raw_gasLimit,
//         raw_to,
//         raw_value,
//         raw_data,
//         raw_action,
//         raw_vote,
//         raw_nickname,
//         raw_asset,
//         raw_assetInfo,
//         raw_subAddress,
//         raw_abi,
//         raw_v,
//         raw_r,
//         raw_s,
//     ] = decoded_tx;
//   let chainId = 1
//
//   var subAddress = hexToString(raw_subAddress)
//   let idx = subAddress.indexOf('AOA')
//   subAddress = subAddress.substring(idx,subAddress.length)
//   var items = [
//     Buffer.from(raw_nonce.substring(2),'hex'),
//     Buffer.from(raw_gasPrice.substring(2),'hex'),
//     Buffer.from(raw_gasLimit.substring(2),'hex'),
//     Buffer.from(raw_to.substring(2),'hex'),
//     Buffer.from(raw_value.substring(2),'hex'),
//     new Buffer(0),
//     Buffer.from(raw_action.substring(2),'hex'),
//     new Buffer(0),
//     new Buffer(0),
//     new Buffer(0),
//     new Buffer(0),
//     subAddress,
//     new Buffer(0),
//     chainId,
//     0,
//     0
//   ]
//
//   const  msgHash = ethUtil.rlphash(items)
//   let v = bigNumberify(raw_v).toNumber()
//   if (chainId > 0) {
//     v -= chainId * 2 + 8
//   }
//   let senderPubKey = ethUtil.ecrecover(msgHash, v, Buffer.from(raw_r.substring(2),'hex'), Buffer.from(raw_s.substring(2),'hex'))
//   let from = ethUtil.publicToAddress(senderPubKey)
//   from = ethUtil.bufferToHex(from)
//   from = HexToAOA(from)
//     var transaction = {
//         from: from,
//         nonce: bigNumberify(raw_nonce).toNumber(),
//         gasPrice: bigNumberify(raw_gasPrice),
//         gasLimit: bigNumberify(raw_gasLimit),
//         to: HexToAOA(raw_to),
//         value: bigNumberify(raw_value),
//         data: raw_data,
//         v: bigNumberify(raw_v).toNumber(),
//         r: raw_r,
//         s: raw_s,
//         action:raw_action,
//         asset:raw_asset,
//         subAddress:subAddress
//     }
//
//     if (transaction.to == '0x') delete transaction.to;
//
//     return transaction;
// }
//
//
//

// 正常地址转账
// const txParams = {
//     nonce: '0x01',
//     gasPrice: '0x09184e72a000',
//     gasLimit: 25000,
//     to: AOAtoHex('AOA2b31c44ccbb50b27b2b283970393f4a3da153a14'),
//     value: '0x1',
//     data: '',
//     action: 0, // 0 for regular/asset transaction, 6 for call contract
//   //   asset: AOAtoHex('AOA0000000000000000000000000000000000000000'), //asset id, use it when asset transaction
//   //  subAddress: 'AOA2b31c44ccbb50b27b2b283970393f4a3da153a1417177ba750f0d7ea5e7045e37abfc6db'
//   }

// // to地址为长地址的转账
const txParams = {
    nonce: '0x00',
    gasPrice: '0x09184e72a000',
    gasLimit: 25000,
    to: AOAtoHex('AOA2b31c44ccbb50b27b2b283970393f4a3da153a14'),
    value: '0x1',
    data: '',
    action: 0, // 0 for regular/asset transaction, 6 for call contract
    subAddress: 'AOA2b31c44ccbb50b27b2b283970393f4a3da153a1417177ba750f0d7ea5e7045e37abfc6db'
}

let tx = new Transaction(txParams)

var privateKey = new Buffer('ee78a0de7de34f55fa4f06f1738807a194f68904d5278c2920e73e266580ca54', 'hex')
tx.sign(privateKey, 1)
// We have a signed transaction, Now for it to be fully fundable the account that we signed
// it with needs to have a certain amount of wei in to. To see how much this
// account needs we can use the getUpfrontCost() method.
// var feeCost = tx.getUpfrontCost()
// tx.gas = feeCost

console.log('-------tx.v:', )
// console.log('Total Amount of wei needed:' + feeCost.toString())
console.log('Tx' + JSON.stringify(tx))

// if your wondering how that is caculated it is
// bytes(data length) * 5
// + 500 Default transaction fee
// + gasAmount * gasPrice

// lets serialize the transaction

console.log('---Serialized TX----')
console.log(tx.serialize().toString('hex'))
console.log('--------------------')

console.log('---Deserialized TX----')
const rawtrx = tx.serialize().toString('hex')
let tx2 = decodeTx('0x' + rawtrx)
console.log('Tx' + JSON.stringify(tx2))
console.log('--------------------')

console.log('---check address----')
console.log(verifyAddress('AOA2b31c44ccbb50b27b2b283970393f4a3da153a14'))
console.log('--------------------')

console.log('------ address generate ---------')
generateAOAAddress()
console.log('--------------------')
// Now that we have the serialized transaction we can get AlethZero to except by
// selecting debug>inject transaction and pasting the transaction serialization and
// it should show up in pending transaction.

// Parsing & Validating transactions
// If you have a transaction that you want to verify you can parse it. If you got
// it directly from the network it will be rlp encoded. You can decode you the rlp
// module. After that you should have something like
// var rawTx = [
//   '0x00',
//   '0x09184e72a000',
//   '0x2710',
//   '0x0000000000000000000000000000000000000000',
//   '0x00',
//   '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
//   '0x1c',
//   '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
//   '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
// ]

// var rawTx =["0x","0x64","0x0186a0","0x140e0b100bc3c5820a5d5ed3cf94d54491f51a2f","0x","0x7f4e616d65526567000000000000000000000000000000000000000000000000003057307f4e616d6552656700000000000000000000000000000000000000000000000000573360455760415160566000396000f20036602259604556330e0f600f5933ff33560f601e5960003356576000335700604158600035560f602b590033560f60365960003356573360003557600035335700","0","0x","0x","0x","0x","0x140e0b100bc3c5820a5d5ed3cf94d54491f51a2fb590033560f603659600033565733600","0x","0x1b","0x41f1fd27db1ac1d2eea828e73bca1413d7400ab15672c14af4220ac90879b0c9","0x4743baf386fd9f7c3382dd80f2276691e559b18638532b81cef4ba33f29f3a57"]

// var tx2 = new Transaction(rawTx)

// Note rlp.decode will actully produce an array of buffers `new Transaction` will
// take either an array of buffers or an array of hex strings.
// So assuming that you were able to parse the tranaction, we will now get the sender's
// address

// console.log('Senders Address: ' + tx2.getSenderAddress().toString('hex'))

// Cool now we know who sent the tx! Lets verfy the signature to make sure it was not
// some poser.

// if (tx2.verifySignature()) {
//   console.log('Signature Checks out!')
// }

// And hopefully its verified. For the transaction to be totally valid we would
// also need to check the account of the sender and see if they have at least
// `TotalFee`.
