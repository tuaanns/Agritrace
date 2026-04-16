import { ethers } from 'ethers';

// Địa chỉ hợp đồng thực tế trên Cronos Testnet
export const CONTRACT_ADDRESS = "0xF89e5e93EC8678F39137943987C7416f5fAE6A17"; 

// ABI mẫu cho tính năng Truy xuất nguồn gốc
export const CONTRACT_ABI = [
  "function addTraceRecord(string maTruyXuat, string action, string location) public",
  "function getTraceCount(string maTruyXuat) public view returns (uint256)",
  "function getRecord(string maTruyXuat, uint256 index) public view returns (string, string, uint256)"
];

export const getContract = async (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};
