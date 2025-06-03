import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface NeonButtonProps extends React.ComponentProps<typeof Button> {
  neonColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'red';
  glowIntensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, neonColor = 'amber', glowIntensity = 'medium', children, ...props }, ref) => {
    const neonClasses = {
      amber: 'neon-glow-amber bg-neon-amber text-cosmic-black hover:bg-neon-amber/90',
      indigo: 'neon-glow-indigo bg-neon-indigo text-cosmic-white hover:bg-neon-indigo/90',
      purple: 'neon-glow-purple bg-neon-purple text-cosmic-white hover:bg-neon-purple/90',
      green: 'neon-glow-green bg-neon-green text-cosmic-black hover:bg-neon-green/90',
      red: 'neon-glow-red bg-neon-red text-cosmic-white hover:bg-neon-red/90'
    };

    const glowClasses = {
      low: 'animate-glow-pulse',
      medium: 'animate-glow-pulse',
      high: 'animate-glow-pulse animate-cosmic-float'
    };

    return (
      <Button
        className={cn(
          neonClasses[neonColor],
          glowClasses[glowIntensity],
          "font-orbitron font-semibold transition-all duration-300 transform hover:scale-105",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

NeonButton.displayName = "NeonButton";

export { NeonButton };
