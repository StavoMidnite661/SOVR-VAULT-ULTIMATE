import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { Wallet as WalletType } from "@shared/schema";

interface WalletCardProps {
  wallet: WalletType;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const balance = parseFloat(wallet.balance || '0');
  const changePercent = Math.random() * 10 - 5; // Mock change percentage
  const isPositive = changePercent >= 0;

  const getWalletIcon = () => {
    switch (wallet.network.toLowerCase()) {
      case 'ethereum':
        return 'from-blue-500 to-indigo-600';
      case 'base':
        return 'from-purple-500 to-pink-600';
      case 'polygon':
        return 'from-purple-600 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getNetworkName = () => {
    switch (wallet.network.toLowerCase()) {
      case 'ethereum':
        return 'Ethereum';
      case 'base':
        return 'Base';
      case 'polygon':
        return 'Polygon';
      default:
        return wallet.network;
    }
  };

  return (
    <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getWalletIcon()} rounded-lg flex items-center justify-center`}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{wallet.name}</p>
              <p className="text-xs text-slate-400 font-mono">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
              <Badge variant="outline" className="text-xs mt-1 border-slate-500">
                {getNetworkName()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
