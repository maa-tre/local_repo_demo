import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

export interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}
