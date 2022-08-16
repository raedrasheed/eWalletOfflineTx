// we use ethers.js which is a library for interacting with the Ethereum Blockchain and its ecosystem
// also we use express js to work with 
const ethers = require('ethers');
const express = require('express');
const web3 = require('web3');
const request = require('request');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 8008


const app = express();


const CONTRACT_ADDRESS_USD = "";
const CONTRACT_ADDRESS_JOD = "";
const CONTRACT_ADDRESS_ILS = "";
const CONTRACT_ADDRESS_WWW = "";
var CONTRACT_ADDRESS = '';


const ABI = [
  'function doTransfer(address _from, address _to, uint256 _amount) returns (bool)',
  'function getBalance(address wallet_addres) public view returns(uint256)'
];

app.get('/', async (req, res) => {
  res.send({
    status: 'Welcome'
  });
});

function assignCurrencyContract(currencyType) {
  if (currencyType === 0)
    CONTRACT_ADDRESS = CONTRACT_ADDRESS_USD;
  else if (currencyType === 1)
    CONTRACT_ADDRESS = CONTRACT_ADDRESS_JOD;
  else if (currencyType === 2)
    CONTRACT_ADDRESS = CONTRACT_ADDRESS_ILS;
  else if (currencyType === 3)
    CONTRACT_ADDRESS = CONTRACT_ADDRESS_WWW;
  else
    console.log('done');
}

// app.get('/transferWei/:val', async (req, res) => {
//   const weiValue = web3.utils.toWei(req.params.val, 'ether');
//   console.log(weiValue);
// })
app.get('/transfer/:val/:sender_account/:recieved_account/:currency', verifyToken, async (req, res) => {

  const provider = ethers.getDefaultProvider('ropsten');

  const admin_account = "";
  const privateKey = ""; //third party

  const currency = parseInt(req.params.currency);
  assignCurrencyContract(currency);

  const wallet = new ethers.Wallet(privateKey, provider);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  const vals = req.params.val;
  const weiValue = web3.utils.toWei(vals, 'ether');
  const sender_account = req.params.sender_account;
  const recieved_account = req.params.recieved_account;

  try {

    // now we just call the function that's already declared in the abi and pass it the known variables
    const result = await contract.doTransfer(sender_account, recieved_account, weiValue);
    jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
      if (err) {
        res.send({ error: err });
      } else {
        // normal response
        res.json({
          status: "1",
          value: weiValue,
          result: result
        });
      }
    });

  } catch (e) {
    res.json(
      e
    );
  }
});
app.get('/balance/:account_address/:currency', verifyToken, async (req, res) => {

  const provider = ethers.getDefaultProvider('ropsten');

  const privateKey = ""; //third party

  const wallet = new ethers.Wallet(privateKey, provider);

  const currency = parseInt(req.params.currency);
  assignCurrencyContract(currency);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  const account_address = req.params.account_address;

  try {// now we just call the function that's already declared in the abi and pass it the known variables
    const wei_result = await contract.getBalance(account_address);
    const fff = web3.utils.fromWei(wei_result.toString(), 'wei');
    const balance = web3.utils.fromWei(wei_result.toString(), 'ether');

    jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
      if (err) {
        res.send({ error: err });
      } else {
        // normal response
        res.send({
          status: true,
          account: account_address,
          weiBalance: fff,
          balance: balance,
          currency: currency
        });
      }
    });


  } catch (e) {
    res.json(
      e
    );
  }
});

app.get('/rates/:from/:to', verifyToken, (req, res) => {
  let from = req.params.from;
  let to = req.params.to;
  request(`https://api.apilayer.com/exchangerates_data/latest?symbols=${to}&base=${from}&apikey=`, (error, response, body) => {
    if (error) {
      // If there is an error, tell the user 
      res.send({ error: error })
    }
    // Otherwise do something with the API data and send a response
    else {
      jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
        if (err) {
          res.send({ error: err });
        } else {
          // normal response
          res.send(body);
        }
      });
    }


  });
}); app.get('/history/:walletAddress/:currency', verifyToken, (req, res) => {
  const walletAddress = req.params.walletAddress;
  console.log(req.params.currency);

  const currency = parseInt(req.params.currency);
  console.log(currency);

  assignCurrencyContract(currency);
  console.log(walletAddress);
  console.log(CONTRACT_ADDRESS);
  request(`https://api-ropsten.etherscan.io/api?module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&address=${walletAddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=desc&apikey=`, (error, response, body) => {
    if (error) {
      // If there is an error, tell the user 
      res.send({ error: error })
    }
    // Otherwise do something with the API data and send a response
    else {
      jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
        if (err) {
          res.send({ error: err });
        } else {
          // normal response
          res.send(body);
        }
      });
    }

  });
});



app.post('/login/:account_address', (req, res) => {

  jwt.sign({ user: req.params.account_address }, 'ethsecretkey', (err, token) => {
    res.json({
      token: token
    });
  });
});


// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }

}

app.listen(port, () => console.log(`Server has started on port: ${port}`))

