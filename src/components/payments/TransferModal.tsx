import React, { useState } from 'react';
import { X, DollarSign, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { usePayments } from '../../context/PaymentsContext';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User | null;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, recipient }) => {
  const [amount, setAmount] = useState<string>('');
  const { transfer, getBalance, isLoading } = usePayments();
  const { user } = useAuth();

  if (!isOpen || !recipient || !user) return null;

  const currentBalance = getBalance(user.id);
  const numAmount = parseFloat(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) return;
    
    try {
      await transfer(user.id, recipient.id, numAmount);
      setAmount('');
      onClose();
    } catch (err) {
      // Error handled in context
    }
  };

  const setMaxAmount = () => {
    setAmount(currentBalance.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fund Entrepreneur</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="mb-6 flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <img 
              src={recipient.avatarUrl} 
              alt={recipient.name} 
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Funding To</p>
              <p className="text-base text-gray-700">{recipient.name}</p>
              {recipient.role === 'entrepreneur' && (
                <p className="text-xs text-gray-500">{(recipient as any).startupName}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <span className="text-sm text-gray-500">
                  Balance: ${currentBalance.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-16 sm:text-lg border-gray-300 rounded-md py-3"
                  placeholder="0.00"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={setMaxAmount}
                    className="text-xs font-medium text-primary-600 hover:text-primary-500"
                  >
                    MAX
                  </button>
                </div>
              </div>
              {numAmount > currentBalance && (
                <p className="mt-2 text-sm text-error-600">Insufficient balance</p>
              )}
            </div>

            <div className="pt-4 flex space-x-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                fullWidth 
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                disabled={!amount || numAmount <= 0 || numAmount > currentBalance}
                leftIcon={<Send size={18} />}
              >
                Send Funds
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
