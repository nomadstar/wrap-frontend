import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { mainnet } from "viem/chains";
import * as React from "react";

// Project ID from WalletConnect (replace with your own)
const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";
// Define chains
const chains = [mainnet] as const;

const metadata = {
  name: "WrapSell",
  description: "A decentralized marketplace for TGC cards and collectibles",
  url: "https://wrapsell.com",
  icons: ["https://wrapsell.com/icon.png"]
};

export const configureWeb3Modal = () => {
  const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata
  });

  createWeb3Modal({
    wagmiConfig,
    projectId,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#4f46e5",
    },
  });
};