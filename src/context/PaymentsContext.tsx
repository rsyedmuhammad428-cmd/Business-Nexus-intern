import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Transaction, PaymentsContextType, Wallet } from '../types';

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

const PAYMENTS_STORAGE_KEY = 'business_nexus_payments';

export const PaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setWallets(parsed.wallets || {});
      setTransactions(parsed.transactions || []);
    } else {
      // Mock initial data
      const initialWallets: Record<string, Wallet> = {
        'e1': { userId: 'e1', balance: 5000 },
        'e2': { userId: 'e2', balance: 0 },
        'e3': { userId: 'e3', balance: 0 },
        'e4': { userId: 'e4', balance: 0 },
        'i1': { userId: 'i1', balance: 150000 },
        'i2': { userId: 'i2', balance: 0 },
        'i3': { userId: 'i3', balance: 0 },
      };
      const initialTransactions: Transaction[] = [
        {
          id: 'tx_1',
          receiverId: 'e1',
          amount: 5000,
          type: 'deposit',
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'tx_2',
          receiverId: 'i1',
          amount: 150000,
          type: 'deposit',
          status: 'completed',
          date: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setWallets(initialWallets);
      setTransactions(initialTransactions);
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify({ wallets: initialWallets, transactions: initialTransactions }));
    }
  }, []);

  const saveToStorage = (newWallets: Record<string, Wallet>, newTransactions: Transaction[]) => {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify({ wallets: newWallets, transactions: newTransactions }));
    setWallets(newWallets);
    setTransactions(newTransactions);
  };

  const getBalance = (userId: string) => {
    return wallets[userId]?.balance || 0;
  };

  const getTransactionsForUser = (userId: string) => {
    return transactions.filter(t => t.senderId === userId || t.receiverId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const deposit = async (userId: string, amount: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        receiverId: userId,
        amount,
        type: 'deposit',
        status: 'completed',
        date: new Date().toISOString()
      };
      
      const newWallets = { ...wallets };
      if (!newWallets[userId]) newWallets[userId] = { userId, balance: 0 };
      newWallets[userId].balance += amount;

      saveToStorage(newWallets, [newTx, ...transactions]);
      toast.success(`Successfully deposited $${amount.toLocaleString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async (userId: string, amount: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const currentBalance = getBalance(userId);
      if (currentBalance < amount) {
        throw new Error('Insufficient funds');
      }

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        senderId: userId,
        amount,
        type: 'withdraw',
        status: 'completed',
        date: new Date().toISOString()
      };
      
      const newWallets = { ...wallets };
      newWallets[userId].balance -= amount;

      saveToStorage(newWallets, [newTx, ...transactions]);
      toast.success(`Successfully withdrew $${amount.toLocaleString()}`);
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const transfer = async (senderId: string, receiverId: string, amount: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const senderBalance = getBalance(senderId);
      if (senderBalance < amount) {
        throw new Error('Insufficient funds to transfer');
      }

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        senderId,
        receiverId,
        amount,
        type: 'transfer',
        status: 'completed',
        date: new Date().toISOString()
      };

      const newWallets = { ...wallets };
      newWallets[senderId].balance -= amount;
      if (!newWallets[receiverId]) newWallets[receiverId] = { userId: receiverId, balance: 0 };
      newWallets[receiverId].balance += amount;

      saveToStorage(newWallets, [newTx, ...transactions]);
      toast.success(`Successfully transferred $${amount.toLocaleString()}`);
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    wallets,
    transactions,
    getBalance,
    getTransactionsForUser,
    deposit,
    withdraw,
    transfer,
    isLoading
  };

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
};

export const usePayments = (): PaymentsContextType => {
  const context = useContext(PaymentsContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
};
