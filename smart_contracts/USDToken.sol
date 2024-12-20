// SPDX-License-Identifier: MIT
// Solidity version pragma
pragma solidity ^0.8.7;

// Importing required dependencies
// ERC20: Provides the implementation for the ERC20 token standard
// IERC20: Interface for ERC20 tokens
// Context: Provides information about the current execution context
// Ownable: Contract module which provides basic access control mechanism
import "./ERC20.sol";
import "./IERC20.sol";
import "./Context.sol";
import "./Ownable.sol";

// USDToken contract inherits ERC20 and Ownable
contract USDToken is ERC20, Ownable {
    // Constructor for initializing the token with a name, symbol, and total supply
    constructor() ERC20("USDToken", "USD") {
        // Mint initial supply to the contract owner
        _mint(msg.sender, 1000000000 * 10**decimals());
    }

    // Function to mint new tokens
    // Can only be called by the contract owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Custom transfer function to facilitate token transfers without fees
    // _from: Address of the sender
    // _to: Address of the receiver
    // _amount: Amount of tokens to be transferred
    function doTransfer(address _from, address _to, uint256 _amount) public returns(bool) {
        return transfareNoFees(_from, _to, _amount);
    }

    // Function to retrieve the balance of a specific wallet address
    // wallet_addres: Address whose balance is to be checked
    function getBalance(address wallet_addres) public view returns(uint256) {
        return balanceOf(wallet_addres);
    }
}
