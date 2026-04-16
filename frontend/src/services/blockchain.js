import { ethers } from 'ethers';

const CRONOS_CHAIN_ID = '0x152'; // 338 in decimal (Cronos Testnet)

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask chưa được cài đặt. Vui lòng cài đặt để sử dụng tính năng này.');
  }

  try {
    // 1. Kiểm tra mạng (Chuyển sang Cronos nếu chưa đúng)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== CRONOS_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CRONOS_CHAIN_ID }],
        });
      } catch (switchError) {
        // Nếu mạng chưa được thêm vào MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CRONOS_CHAIN_ID,
                chainName: 'Cronos Testnet',
                nativeCurrency: { name: 'tCRO', symbol: 'tCRO', decimals: 18 },
                rpcUrls: ['https://evm-t3.cronos.org'],
                blockExplorerUrls: ['https://cronoscan.com/testnet'],
              },
            ],
          });
        }
      }
    }

    // 2. Yêu cầu kết nối tài khoản
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Khởi tạo Provider từ MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Lấy thông tin Signer (người dùng hiện tại)
    const signer = await provider.getSigner();
    
    // Lấy địa chỉ ví
    const address = await signer.getAddress();
    
    // Lấy số dư (Balance) - Tùy chọn
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);

    return {
      success: true,
      address,
      balance: formattedBalance,
      provider,
      signer
    };
  } catch (err) {
    if (err.code === 4001) {
      throw new Error('Bạn đã từ chối yêu cầu kết nối.');
    }
    throw err;
  }
};

export const getWalletAddress = async () => {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  }
  return null;
};
