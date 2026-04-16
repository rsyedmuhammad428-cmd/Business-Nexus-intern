import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/users';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const { user } = useAuth();

  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions found.</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-success-500" size={16} />;
      case 'pending': return <Clock className="text-warning-500" size={16} />;
      case 'failed': return <XCircle className="text-error-500" size={16} />;
      default: return null;
    }
  };

  const getUserName = (id?: string) => {
    if (!id) return 'System';
    if (id === user?.id) return 'You';
    const foundUser = users.find(u => u.id === id);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getTransactionDetails = (tx: Transaction) => {
    const isReceiver = tx.receiverId === user?.id;
    const isSender = tx.senderId === user?.id;

    if (tx.type === 'deposit') {
      return {
        icon: <ArrowDownRight className="text-success-600" size={20} />,
        iconBg: 'bg-success-100',
        label: 'Deposit',
        counterparty: 'Bank Transfer',
        amountPrefix: '+',
        amountColor: 'text-success-600'
      };
    }
    if (tx.type === 'withdraw') {
      return {
        icon: <ArrowUpRight className="text-error-600" size={20} />,
        iconBg: 'bg-error-100',
        label: 'Withdrawal',
        counterparty: 'Bank Transfer',
        amountPrefix: '-',
        amountColor: 'text-gray-900'
      };
    }
    
    // Transfer
    if (isSender) {
      return {
        icon: <ArrowUpRight className="text-warning-600" size={20} />,
        iconBg: 'bg-warning-100',
        label: 'Transfer Sent',
        counterparty: getUserName(tx.receiverId),
        amountPrefix: '-',
        amountColor: 'text-gray-900'
      };
    } else {
      return {
        icon: <ArrowDownRight className="text-success-600" size={20} />,
        iconBg: 'bg-success-100',
        label: 'Transfer Received',
        counterparty: getUserName(tx.senderId),
        amountPrefix: '+',
        amountColor: 'text-success-600'
      };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => {
            const details = getTransactionDetails(tx);
            
            return (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full ${details.iconBg}`}>
                      {details.icon}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{details.label}</div>
                      <div className="text-sm text-gray-500">{details.counterparty}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{format(new Date(tx.date), 'MMM d, yyyy')}</div>
                  <div className="text-sm text-gray-500">{format(new Date(tx.date), 'h:mm a')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-semibold ${details.amountColor}`}>
                    {details.amountPrefix}{"$"}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(tx.status)}
                    <span className="ml-2 text-sm text-gray-700 capitalize">{tx.status}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
