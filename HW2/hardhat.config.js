require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-goerli.g.alchemy.com/v2/0FtJhESkXxCpmahbhYqn_kl7T5Du4QUP",
        blockNumber: 8335158 
      }
    }
  }
};
