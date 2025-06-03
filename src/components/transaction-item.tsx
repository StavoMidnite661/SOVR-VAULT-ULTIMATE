import { Badge } from "@/components/ui/badge";
import { 
  ArrowDown, 
  ArrowUp, 
  Send, 
  Bot, 
  FileText, 
  DollarSign 
} from "lucide-react";
import type { Transaction } from "@shared/schema";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const amount = parseFloat(transaction.amount);
  const isIncoming = transaction.type === 'receive';

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'receive':
        return { icon: ArrowDown, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'send':
        return { icon: ArrowUp, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'mass_payment':
        return { icon: Send, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'ai_action':
        return { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'invoice':
        return { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20' };
      default:
        return { icon: DollarSign, color: 'text-slate-400', bg: 'bg-slate-500/20' };
    }
  };

  const getTransactionLabel = () => {
    switch (transaction.type) {
      case 'receive':
        return `Received ${transaction.token}`;
      case 'send':
        return `Sent ${transaction.token}`;
      case 'mass_payment':
        return 'Mass Payment';
      case 'ai_action':
        return 'AI Agent Action';
      case 'invoice':
        return 'Invoice Payment';
      default:
        return 'Transaction';
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const { icon: Icon, color, bg } = getTransactionIcon();

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium">{getTransactionLabel()}</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-slate-400">
              {formatTime(transaction.createdAt!)}
            </p>
            <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
              {transaction.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
          {isIncoming ? '+' : '-'}${amount.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </p>
        <p className="text-xs text-slate-400 capitalize">{transaction.network}</p>
      </div>
    </div>
  );
}
