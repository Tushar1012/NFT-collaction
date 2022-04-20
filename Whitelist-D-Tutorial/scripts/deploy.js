const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so cryptoDevsContract here is a factory for instances of our CryptoDevs contract.
  */
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  // deploy the contract
  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );

  // print the address of the deployed contract
  console.log(
    "Crypto Devs Contract Address:",
    deployedCryptoDevsContract.address
  );
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });











































/*

//nft trail


const { ethers } = require("hardhat");
async function main() {
  const whilelistContract = await ethers.getContractFactory("CryptoDevs");
  //here we deploy the contract
    
  const deployedWhitelistContract = await whilelistContract.deploy(20);
  // 10 is the maximum number of whitelisted addrress allowed

  //wait for if to finish deploying
  await deployedWhitelistContract.deployed();

  //print the address of the deplyed contract
  console.log("whitelist contract Address to  :", deployedWhitelistContract.address);
}
// call the main function and catch it there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => { 
    console.error(error);
    process.exit(1);
});


*/