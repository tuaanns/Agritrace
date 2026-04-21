import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  paths: {
    sources: "./blockchain",
  },
  networks: {
    cronosTestnet: {
      url: "https://evm-t3.cronos.org",
      accounts: ["c0b8b96cc39a4c7f06881bd39b4d0bd7251b41d42dcc3e329b365af589b9b9ff"], 
    },
  },
};

export default config;
