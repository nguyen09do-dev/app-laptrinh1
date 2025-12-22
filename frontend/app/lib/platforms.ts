import {
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  Search,
  Facebook,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import { ContentDerivatives } from '@/app/components/derivatives';

export type PlatformCategory = 'email' | 'blog' | 'social';

export interface PlatformConfig {
  key: string;
  name: string;
  category: PlatformCategory;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  derivativeKey: keyof ContentDerivatives;
  requiresConfig: boolean;
  description: string;
}

export const PLATFORMS: PlatformConfig[] = [
  // Email Marketing
  {
    key: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    icon: Mail,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    derivativeKey: 'email',
    requiresConfig: true,
    description: 'Email newsletter campaigns',
  },
  
  // Blogging
  {
    key: 'wordpress',
    name: 'WordPress',
    category: 'blog',
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    derivativeKey: 'blog_summary',
    requiresConfig: true,
    description: 'Blog post publishing',
  },
  
  // Social Media
  {
    key: 'twitter',
    name: 'Twitter',
    category: 'social',
    icon: Twitter,
    color: 'text-[#1DA1F2]',
    bgColor: 'bg-[#1DA1F2]/10',
    derivativeKey: 'twitter_thread',
    requiresConfig: true,
    description: 'Twitter thread posts',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    icon: Linkedin,
    color: 'text-[#0A66C2]',
    bgColor: 'bg-[#0A66C2]/10',
    derivativeKey: 'linkedin',
    requiresConfig: true,
    description: 'LinkedIn professional posts',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    category: 'social',
    icon: Facebook,
    color: 'text-[#1877F2]',
    bgColor: 'bg-[#1877F2]/10',
    derivativeKey: 'linkedin', // Reuse LinkedIn content for now
    requiresConfig: true,
    description: 'Facebook posts',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    category: 'social',
    icon: Instagram,
    color: 'text-[#E4405F]',
    bgColor: 'bg-[#E4405F]/10',
    derivativeKey: 'linkedin', // Reuse LinkedIn content for now
    requiresConfig: true,
    description: 'Instagram posts',
  },
  {
    key: 'zalo',
    name: 'Zalo',
    category: 'social',
    icon: MessageCircle,
    color: 'text-[#0068FF]',
    bgColor: 'bg-[#0068FF]/10',
    derivativeKey: 'linkedin', // Reuse LinkedIn content for now
    requiresConfig: true,
    description: 'Zalo posts',
  },
];

export const PLATFORMS_BY_CATEGORY: Record<PlatformCategory, PlatformConfig[]> = {
  email: PLATFORMS.filter(p => p.category === 'email'),
  blog: PLATFORMS.filter(p => p.category === 'blog'),
  social: PLATFORMS.filter(p => p.category === 'social'),
};

export function getPlatformByKey(key: string): PlatformConfig | undefined {
  return PLATFORMS.find(p => p.key === key);
}




