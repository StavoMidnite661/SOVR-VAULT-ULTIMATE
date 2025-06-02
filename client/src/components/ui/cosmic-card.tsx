import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CosmicCardProps extends React.ComponentProps<typeof Card> {
  neonColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'red';
  variant?: 'default' | 'gradient' | 'glass';
  children: React.ReactNode;
}

const CosmicCard = forwardRef<HTMLDivElement, CosmicCardProps>(
  ({ className, neonColor = 'amber', variant = 'default', children, ...props }, ref) => {
    const neonClasses = {
      amber: 'neon-glow-amber',
      indigo: 'neon-glow-indigo',
      purple: 'neon-glow-purple',
      green: 'neon-glow-green',
      red: 'neon-glow-red'
    };

    const variantClasses = {
      default: 'bg-cosmic-slate',
      gradient: 'cosmic-gradient bg-cosmic-slate',
      glass: 'bg-cosmic-slate/80 backdrop-blur-sm'
    };

    return (
      <Card
        className={cn(
          variantClasses[variant],
          neonClasses[neonColor],
          "border-cosmic-gray transition-all duration-300 hover:scale-[1.02]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

CosmicCard.displayName = "CosmicCard";

export { CosmicCard };
