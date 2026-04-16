import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TransactionTable } from '../../components/payments/TransactionTable';
import { Input } from '../../components/ui/Input';
import { TransferModal } from '../../components/payments/TransferModal';
import { getUsersByRole } from '../../data/users';
import { User } from '../../types';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const { getBalance, getTransactionsForUser, deposit, withdraw, isLoading: isPaymentLoading } = usePayments();
  
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);

  if (!user) return null;

  const recipients = user.role === 'investor' ? getUsersByRole('entrepreneur') : [];
  const balance = getBalance(user.id);
  const transactions = getTransactionsForUser(user.id);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (activeTab === 'deposit') {
        await deposit(user.id, numAmount);
      } else {
        await withdraw(user.id, numAmount);
      }
      setAmount('');
    } catch (error) {
      // Errors handled in context
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
        <p className="text-gray-600">Manage your funds and transaction history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Balance & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <WalletIcon size={24} className="text-white" />
                </div>
                <span className="text-primary-100 text-sm font-medium">Available Balance</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-1">{"$"}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <p className="text-primary-200 text-sm">USD</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Quick Transfer</h3>
            </CardHeader>
            <CardBody>
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'deposit' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('deposit')}
                >
                  Deposit
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'withdraw' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('withdraw')}
                >
                  Withdraw
                </button>
              </div>

              <form onSubmit={handleTransaction}>
                <Input
                  label="Amount (USD)"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  fullWidth
                />
                
                <div className="mt-4">
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isPaymentLoading}
                    variant={activeTab === 'deposit' ? 'primary' : 'outline'}
                    leftIcon={activeTab === 'deposit' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  >
                    {activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {user.role === 'investor' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Send Funds to Entrepreneur</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose entrepreneur</label>
                    <select
                      value={selectedRecipient?.id || ''}
                      onChange={(e) => setSelectedRecipient(recipients.find(r => r.id === e.target.value) || null)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3"
                    >
                      <option value="">Select entrepreneur</option>
                      {recipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name} — {recipient.startupName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      fullWidth
                      onClick={() => setIsTransferModalOpen(true)}
                      disabled={!selectedRecipient}
                      leftIcon={<Send size={18} />}
                    >
                      Send Funds
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Activity size={20} className="text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <TransactionTable transactions={transactions} />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        recipient={selectedRecipient}
      />
    </div>
  );
};
