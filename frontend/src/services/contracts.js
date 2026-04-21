import { ethers } from 'ethers';

// Địa chỉ hợp đồng thực tế trên Cronos Testnet
export const CONTRACT_ADDRESS = "0x23Ebe49cE168Fff0857c165010927BcE50032534"; 

// ABI mẫu cho tính năng Truy xuất nguồn gốc
export const CONTRACT_ABI = [
  "function owner() public view returns (address)",
  "function addTraceRecord(string maTruyXuat, string action, string location) public",
  "function getTraceCount(string maTruyXuat) public view returns (uint256)",
  "function getRecord(string maTruyXuat, uint256 index) public view returns (string, string, uint256)"
];

export const getContract = async (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};
