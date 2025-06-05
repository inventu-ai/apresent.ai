"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'gradient';
  showIcon?: boolean;
  className?: string;
}

const planConfig = {
  FREE: {
    label: 'Gratuito',
    icon: Zap,
    colors: {
      solid: 'bg-gray-500 text-white hover:bg-gray-600',
      outline: 'border-gray-500 text-gray-600 hover:bg-gray-50',
      gradient: 'bg-gray-500 text-white'
    }
  },
  PRO: {
    label: 'Pro',
    icon: Star,
    colors: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border-blue-600 text-blue-600 hover:bg-blue-50',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
    }
  },
  PREMIUM: {
    label: 'Premium',
    icon: Crown,
    colors: {
      solid: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      outline: 'border-yellow-500 text-yellow-600 hover:bg-yellow-50',
      gradient: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white'
    }
  }
};

const sizeConfig = {
  xs: {
    badge: 'px-1.5 py-0.5 text-xs',
    icon: 'h-2.5 w-2.5'
  },
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3'
  },
  md: {
    badge: 'px-2.5 py-1.5 text-sm',
    icon: 'h-3.5 w-3.5'
  },
  lg: {
    badge: 'px-3 py-2 text-base',
    icon: 'h-4 w-4'
  }
};

export function PlanBadge({ 
  plan, 
  size = 'sm', 
  variant = 'solid', 
  showIcon = true, 
  className 
}: PlanBadgeProps) {
  const config = planConfig[plan];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1 font-medium border-0',
        config.colors[variant],
        sizeStyles.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeStyles.icon} />}
      {config.label}
    </Badge>
  );
}
