export interface MarketplacePrompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  language: string;
  category: string;
  author: string;
  rating: number;
  downloads: number;
  createdAt: Date;
} 