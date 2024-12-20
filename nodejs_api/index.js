// Import required libraries
// ethers.js: For interacting with the Ethereum Blockchain and its ecosystem
// express.js: For creating the REST API
// web3: For additional Ethereum utilities
// request: For making HTTP requests to external APIs
// jsonwebtoken: For handling JWT authentication
const ethers = require('ethers');
const express = require('express');
const web3 = require('web3');
const request = require('request');
const jwt = require('jsonwebtoken');

// Define the port for the server
define a port number or fallback to 8008
const port = process.env.PORT || 8008;

// Initialize express application
const app = express();

// Contract addresses for different currencies
const CONTRACT_ADDRESS_USD = "";
const CONTRACT_ADDRESS_JOD = "";
const CONTRACT_ADDRESS_ILS = "";
const CONTRACT_ADDRESS_WWW = "";
var CONTRACT_ADDRESS = '';

// ABI (Application Binary Interface) for interacting with the smart contract
const ABI = [
  'function doTransfer(address _from, address _to, uint256 _amount) returns (bool)',
  'function getBalance(address wallet_addres) public view returns(uint256)'
];

// Base route to verify server is running
app.get('/', async (req, res) => {
  res.send({
    status: 'Welcome'
  });
});

// Function to assign the correct contract address based on currency type
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

// Endpoint for transferring tokens between accounts
app.get('/transfer/:val/:sender_account/:recieved_account/:currency', verifyToken, async (req, res) => {

  // Create a provider for connecting to the Ethereum network
  const provider = ethers.getDefaultProvider('ropsten');

  // Define admin account credentials
  const admin_account = "";
  const privateKey = ""; //third party private key

  // Parse currency type and assign contract address
  const currency = parseInt(req.params.currency);
  assignCurrencyContract(currency);

  // Initialize wallet with the private key and provider
  const wallet = new ethers.Wallet(privateKey, provider);

  // Initialize the contract object
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  // Extract parameters from the request
  const vals = req.params.val;
  const weiValue = web3.utils.toWei(vals, 'ether'); // Convert value to Wei
  const sender_account = req.params.sender_account;
  const recieved_account = req.params.recieved_account;

  try {
    // Call the doTransfer function in the smart contract
    const result = await contract.doTransfer(sender_account, recieved_account, weiValue);

    // Verify JWT and send response
    jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
      if (err) {
        res.send({ error: err });
      } else {
        res.json({
          status: "1",
          value: weiValue,
          result: result
        });
      }
    });

  } catch (e) {
    res.json(e);
  }
});

// Endpoint for checking account balance
app.get('/balance/:account_address/:currency', verifyToken, async (req, res) => {

  // Create a provider for connecting to the Ethereum network
  const provider = ethers.getDefaultProvider('ropsten');

  const privateKey = ""; //third party private key

  // Initialize wallet and assign contract address
  const wallet = new ethers.Wallet(privateKey, provider);
  const currency = parseInt(req.params.currency);
  assignCurrencyContract(currency);

  // Initialize the contract object
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  const account_address = req.params.account_address;

  try {
    // Call the getBalance function in the smart contract
    const wei_result = await contract.getBalance(account_address);
    const fff = web3.utils.fromWei(wei_result.toString(), 'wei');
    const balance = web3.utils.fromWei(wei_result.toString(), 'ether');

    // Verify JWT and send response
    jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
      if (err) {
        res.send({ error: err });
      } else {
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
    res.json(e);
  }
});

// Endpoint for fetching exchange rates
app.get('/rates/:from/:to', verifyToken, (req, res) => {
  let from = req.params.from;
  let to = req.params.to;

  // Call external API to get exchange rates
  request(`https://api.apilayer.com/exchangerates_data/latest?symbols=${to}&base=${from}&apikey=`, (error, response, body) => {
    if (error) {
      res.send({ error: error });
    } else {
      // Verify JWT and send response
      jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
        if (err) {
          res.send({ error: err });
        } else {
          res.send(body);
        }
      });
    }
  });
});

// Endpoint for fetching transaction history of a wallet
app.get('/history/:walletAddress/:currency', verifyToken, (req, res) => {
  const walletAddress = req.params.walletAddress;

  const currency = parseInt(req.params.currency);
  assignCurrencyContract(currency);

  // Call external API to get transaction history
  request(`https://api-ropsten.etherscan.io/api?module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&address=${walletAddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=desc&apikey=`, (error, response, body) => {
    if (error) {
      res.send({ error: error });
    } else {
      jwt.verify(req.token, 'ethsecretkey', (err, authData) => {
        if (err) {
          res.send({ error: err });
        } else {
          res.send(body);
        }
      });
    }
  });
});

// Endpoint for generating JWT token
app.post('/login/:account_address', (req, res) => {
  jwt.sign({ user: req.params.account_address }, 'ethsecretkey', (err, token) => {
    res.json({
      token: token
    });
  });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization']; // Extract authorization header
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' '); // Split the Bearer token
    const bearerToken = bearer[1];
    req.token = bearerToken; // Set token for further use
    next(); // Call next middleware
  } else {
    res.sendStatus(403); // Forbidden
  }
}

// Start the server on the specified port
app.listen(port, () => console.log(`Server has started on port: ${port}`));
