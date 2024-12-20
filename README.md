# eWalletOfflineTx

A blockchain-based mobile wallet application that supports secure offline transactions using Bluetooth and digital signatures. This project is designed to address the challenges of performing mobile payments in areas with limited or no internet access.

---

## Key Features

- **Offline Transactions**: Conduct secure peer-to-peer transactions without an active internet connection using Bluetooth.
- **Blockchain Integration**: Leverages Ethereum blockchain and smart contracts for transaction integrity and security.
- **Digital Signatures**: Ensures secure and tamper-proof transactions with cryptographic signatures.
- **Token Divisibility**: Allows users to divide tokens for partial payments.
- **Mobile App**: Android-based application for sending, receiving, and managing offline tokens.
- **Cost-Effective**: No specialized hardware required, making it accessible for users in remote areas.

---

## Technologies Used

### Backend
- **Node.js**: Backend API for communication between the mobile app and the smart contract.
- **Ethereum Smart Contracts**: Deployed on the Ropsten test network using Solidity.
- **Key Packages**: 
  - `ethers`
  - `web3`
  - `express`

### Frontend
- **Android Studio**: Developed an intuitive mobile application interface.
- **JSON Storage**: Used for local storage of transaction data and public keys.

---

## Architecture Overview

1. **Preparation Stage**:
   - Clients obtain an updated public key database from the Offline Token Manager (OTM).
   
2. **Transaction Flow**:
   - **Step 1**: Sender requests Offline Tokens (OTs) from the OTM while online.
   - **Step 2**: Sender transfers OTs to the receiver via Bluetooth in offline mode.
   - **Step 3**: Receiver sends OTs back to the OTM to convert them into real coins when online.

---

## How to Use

### Prerequisites
1. **Ethereum Testnet Wallet**: Use MetaMask or a similar wallet connected to the Ropsten test network.
2. **Android Device**: To run the mobile application.
3. **Node.js**: To set up the backend API.

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/raedrasheed/eWalletOfflineTx.git
   cd eWalletOfflineTx
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure environment variables for Ethereum node and wallet.
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Smart Contract Deployment**:
   - Deploy the `TokenManager` contract using Ethereum Remix or Truffle.
   - Update the backend API with the contract address and ABI.

4. **Android App**:
   - Open the mobile application source in Android Studio.
   - Update the API endpoint to point to your backend server.
   - Build and install the APK on your Android device.

---

## Project Structure

```plaintext
.
├── backend/                # Node.js backend API
├── contracts/              # Solidity smart contract source files
├── mobile-app/             # Android application source code
├── README.md               # Documentation file
```

---

## Screenshots

### Mobile App Interface
1. **Main Screen**: Displays account balances.
2. **Send Screen**: Allows sending OTs to another user.
3. **Receive Screen**: Displays QR code and wallet address for receiving OTs.
4. **History Screen**: Shows a history of offline transactions.

---

## Comparison with Other Systems

| System         | Offline Transactions | Token Divisibility | Hardware Required | Mobility | Token Tampering Prevention |
|----------------|-----------------------|--------------------|-------------------|----------|----------------------------|
| Pure Wallet    | Yes                   | No                 | No                | Yes      | No                         |
| BlueWallet     | No                    | Yes                | Yes               | Yes      | No                         |
| Proposed System| Yes                   | Yes                | No                | Yes      | Yes                        |

---

## Future Improvements

- Enhance scalability for high transaction volumes.
- Integrate support for additional blockchain networks.
- Optimize energy efficiency of the underlying blockchain mechanisms.

---

## License

This project is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

---

## Contributors

- **Raed Saeed Rasheed**
- **Khalil Hamdi Ateyeh Al-Shqeerat**
- **Ahmed Salah Ghorab**
- **Fuad Salama AbuOwaimer**
- **Aiman Ahmed AbuSamra**

For inquiries, please contact: [rrasheed@iugaza.edu.ps](mailto:rrasheed@iugaza.edu.ps)



