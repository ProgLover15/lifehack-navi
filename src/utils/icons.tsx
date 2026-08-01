import React from 'react';
import { 
  Sparkles, 
  Laptop, 
  UtensilsCrossed, 
  Sparkle, 
  Briefcase, 
  GraduationCap, 
  Wallet, 
  Scale, 
  Landmark, 
  ShieldAlert,
  Zap,
  Soup,
  Mail,
  FileText,
  Coins,
  Coffee,
  PiggyBank,
  CheckCircle2,
  Bookmark,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Search,
  MessageSquarePlus,
  Send,
  Loader2,
  Trophy,
  HelpCircle,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  X,
  ExternalLink,
  KeyRound
} from 'lucide-react';

export function getIcon(iconName: string, className: string = "w-5 h-5"): React.ReactNode {
  switch (iconName) {
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'UtensilsCrossed': return <UtensilsCrossed className={className} />;
    case 'Sparkle': return <Sparkle className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Wallet': return <Wallet className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Soup': return <Soup className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'Coins': return <Coins className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'PiggyBank': return <PiggyBank className={className} />;
    case 'Flame': return <Flame className={className} />;
    default: return <Lightbulb className={className} />;
  }
}

export {
  Sparkles, 
  Laptop, 
  UtensilsCrossed, 
  Sparkle, 
  Briefcase, 
  GraduationCap, 
  Wallet, 
  Scale, 
  Landmark, 
  ShieldAlert,
  Zap,
  Soup,
  Mail,
  FileText,
  Coins,
  Coffee,
  PiggyBank,
  CheckCircle2,
  Bookmark,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Search,
  MessageSquarePlus,
  Send,
  Loader2,
  Trophy,
  HelpCircle,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  X,
  ExternalLink,
  KeyRound
};
