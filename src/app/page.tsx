"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  HardDrive,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation"; // Para Next.js 13+
import { apiService } from "@/services/api";
import UserCreationStatus from "@/components/ui/UserCreationStatus";
import Navbar from "@/components/webcomponents/Navbar";
import WalletGuard from "@/components/WalletGuard";

const SIMPLE_STORAGE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SIMPLE_STORAGE_CONTRACT_ADDRESS;

// Simple Storage ABI
const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: "get",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
    name: "set",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="animated-bg">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={`bubble bubble${(index % 5) + 1}`}></div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-gray-800/20 to-slate-900/25"></div>
      <div className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-gray-700 text-white p-12 text-center shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Welcome to <span className="text-yellow-300">WrapSell</span>
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto">
            Buy and sell TCG cards with crypto.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <HardDrive className="w-5 h-5" />
              <span className="text-sm font-medium">TCG Marketplace</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Crypto Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusMessage = ({
  message,
  type,
}: {
  message: string;
  type: string;
}) => {
  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 mb-6 flex items-center space-x-3 ${getStyles()}`}
    >
      {getIcon()}
      <span className="font-medium">{message}</span>
    </div>
  );
};

function WrapSellApp() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const router = useRouter(); // Hook para navegación
  const [newValue, setNewValue] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [userCreationError, setUserCreationError] = useState<string | null>(null);

  // Read contract value
  const {
    data: contractValue,
    isLoading: isReading,
    refetch: refetchValue,
    error: readError,
  } = useReadContract({
    address: SIMPLE_STORAGE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SIMPLE_STORAGE_ABI,
    functionName: "get",
    query: {
      enabled: isConnected,
    },
  });

  // Write contract
  const {
    writeContract,
    data: writeData,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const showMessage = (msg: string, type: string = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Función para crear usuario automáticamente
  const createUserAutomatically = async (walletAddress: string) => {
    if (userCreated || isCreatingUser) return;

    setIsCreatingUser(true);
    setUserCreationError(null);
    showMessage("🔄 Creating user account...", "info");

    try {
      // Primero intentar obtener el usuario existente
      try {
        const existingUser = await apiService.getUser(walletAddress);
        if (existingUser) {
          setUserCreated(true);
          showMessage("✅ User account found!", "success");
          return;
        }
      } catch (error) {
        // Usuario no existe, lo creamos
        console.log("User doesn't exist, creating new user...");
      }

      // Crear nuevo usuario
      const userData = {
        wallet_address: walletAddress,
        wallet_type: "ethereum", // Detectar automáticamente si es necesario
        username: `User_${walletAddress.slice(0, 8)}`, // Username basado en la wallet
        email: undefined, // Opcional
      };

      console.log("Creating user with data:", userData);
      const newUser = await apiService.createUser(userData);
      setUserCreated(true);
      showMessage(
        "🎉 User account created successfully!",
        "success"
      );

      console.log("User created:", newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      let errorMessage = "Unknown error creating user account";

      if (error instanceof Error) {
        if (error.message.includes("Usuario ya existe")) {
          setUserCreated(true);
          showMessage("✅ User account already exists!", "success");
          return;
        } else {
          errorMessage = error.message;
        }
      }

      setUserCreationError(errorMessage);
      showMessage(
        `❌ Error creating user: ${errorMessage}`,
        "error"
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Efecto para crear usuario y redirigir cuando se conecte la billetera
  useEffect(() => {
    if (isConnected && address && !isRedirecting) {
      // Primero crear el usuario automáticamente
      createUserAutomatically(address).then(() => {
        // Solo redirigir si el usuario fue creado exitosamente
        if (userCreated || !userCreationError) {
          setIsRedirecting(true);
          showMessage(
            "🎉 Wallet connected! Redirecting to dashboard...",
            "success"
          );

          // Pequeño delay para mostrar el mensaje antes de redirigir
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      });
    }
  }, [isConnected, address, router, isRedirecting, userCreated, userCreationError]);

  // Efecto para resetear estados cuando se desconecte la wallet
  // NOTA: No reseteamos cuando se desconecta porque queremos mantener la conexión
  // El WalletGuard se encargará de redirigir si es necesario

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      showMessage(
        "🚀 Transaction confirmed! Value updated successfully.",
        "success"
      );
      setNewValue("");
      // Refetch the contract value after successful write
      setTimeout(() => {
        refetchValue();
      }, 1000);
    }
  }, [isConfirmed, refetchValue]);

  // Handle errors
  useEffect(() => {
    if (readError) {
      showMessage(`❌ Error reading contract: ${readError.message}`, "error");
    }
  }, [readError]);

  useEffect(() => {
    if (writeError) {
      showMessage(`❌ Transaction failed: ${writeError.message}`, "error");
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      showMessage(
        `❌ Transaction confirmation failed: ${confirmError.message}`,
        "error"
      );
    }
  }, [confirmError]);

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = async () => {
    // Solo abrir el modal de AppKit para gestión de wallet
    // No desconectar realmente ya que queremos mantener la conexión
    open();
  };

  const handleReadValue = () => {
    setMessage("");
    refetchValue();
    showMessage("✅ Contract value refreshed!", "success");
  };

  const handleWriteValue = async () => {
    if (newValue === "") {
      showMessage("Please enter a value to write", "error");
      return;
    }

    if (isNaN(Number(newValue)) || Number(newValue) < 0) {
      showMessage("Please enter a valid positive number", "error");
      return;
    }

    try {
      writeContract({
        address: SIMPLE_STORAGE_CONTRACT_ADDRESS as `0x${string}`,
        abi: SIMPLE_STORAGE_ABI,
        functionName: "set",
        args: [BigInt(newValue)],
      });
      showMessage(
        "📝 Transaction submitted! Waiting for confirmation...",
        "info"
      );
    } catch (error) {
      console.error("Error writing value:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showMessage(`❌ Transaction failed: ${errorMessage}`, "error");
    }
  };

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <Hero />

        <main className="max-w-4xl mx-auto p-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Smart Contract Interaction
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This dApp demonstrates real blockchain interactions with a Simple
              Storage contract. Connect your wallet to read and write values on
              the blockchain.
            </p>
            <div className="mt-4 text-sm text-gray-500 font-mono bg-gray-100 rounded-lg p-2 inline-block">
              Contract: {SIMPLE_STORAGE_CONTRACT_ADDRESS}
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
              {message && <StatusMessage message={message} type={messageType} />}

              {isConnected ? (
                <div className="space-y-8">
                  {(isCreatingUser || userCreated || isRedirecting || userCreationError) ? (
                    // Mostrar estado de creación de usuario y redirección
                    <UserCreationStatus
                      isCreatingUser={isCreatingUser}
                      userCreated={userCreated}
                      isRedirecting={isRedirecting}
                      error={userCreationError || undefined}
                    />
                  ) : (
                    <>
                      {/* Wallet Info */}
                      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                        <div className="flex items-center justify-center mb-3">
                          <Wallet className="w-6 h-6 text-green-600 mr-2" />
                          <span className="font-semibold text-green-800">
                            Wallet Connected
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-mono break-all">
                          {address}
                        </p>
                      </div>

                      {/* Read Contract */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={handleReadValue}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                            disabled={isReading}
                          >
                            <RefreshCw
                              className={`w-5 h-5 ${isReading ? "animate-spin" : ""
                                }`}
                            />
                            <span>{isReading ? "Reading..." : "Read Value"}</span>
                          </button>

                          {contractValue !== undefined &&
                            contractValue !== null && (
                              <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">
                                  Current Value
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  {contractValue.toString()}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Write Contract */}
                      <div className="space-y-4">
                        <input
                          type="number"
                          placeholder="Enter new value (e.g., 42)"
                          className="w-full border border-gray-300 rounded-xl py-4 px-5 text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-inner"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          min="0"
                          disabled={isWriting || isConfirming}
                        />
                        <button
                          onClick={handleWriteValue}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                          disabled={isWriting || isConfirming}
                        >
                          <HardDrive
                            className={`w-5 h-5 ${isWriting || isConfirming ? "animate-pulse" : ""
                              }`}
                          />
                          <span>
                            {isWriting
                              ? "Sending Transaction..."
                              : isConfirming
                                ? "Confirming..."
                                : "Write Value"}
                          </span>
                        </button>
                      </div>

                      {/* El botón de wallet ahora está en el Navbar */}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="p-8">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Welcome to WrapSell
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Connect your wallet using the button in the navigation bar to start interacting with the smart contract
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <HardDrive className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">TCG Marketplace</h3>
              <p className="text-gray-600">
                Buy, sell, and discover your favorite TCG cards
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Secure Crypto Payments
              </h3>
              <p className="text-gray-600">
                Use crypto to buy and sell cards safely and securely
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <Wallet className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Connection</h3>
              <p className="text-gray-600">
                Connect your wallet and start trading TCG cards
              </p>
            </div>
          </div>
        </main>
      </div>
    </WalletGuard>
  );
}

export default WrapSellApp;
