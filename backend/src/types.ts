export interface MonorailTokenData {
  address?: string;
  balance?: string;
  categories?: string[];
  decimals?: number;
  mon_per_token?: string;
  mon_value?: string;
  name?: string;
  pconf?: string;
  symbol?: string;
  usd_per_token?: string;
  totalSupply?: string;
  holders?: number;
}

export interface BlockvisionTokenDetail {
  code: number;
  reason: string;
  message: string;
  result?: {
    contractAddress: string;
    logo: string;
    symbol: string;
    decimals: number;
    name: string;
    website: string;
    totalSupply: string;
    verified: boolean;
  };
}

export interface BlockvisionTokenHolders {
  code: number;
  reason: string;
  message: string;
  result?: {
    totalHolder?: number;
    holders?: Array<{
      address: string;
      balance: number;
      percentage: number;
    }>;
    data?: Array<{
      holder: string;
      accountAddress: string;
      percentage: string;
      amount: string;
      isContract: boolean;
    }>;
    nextPageIndex?: number;
  };
}

export interface BlockvisionTokenGating {
  code: number;
  reason: string;
  message: string;
  result?: {
    qualified: boolean;
    holdings: Array<{
      tokenAddress: string;
      balance: string;
      balanceWithDecimals: string;
    }>;
  };
}

export interface RiskAnalysis {
  score: number;
  level: 'Good' | 'Normal' | 'Danger';
  reasons: string[];
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  avatarUrl: string | null;
  price: number;
  priceMon: number;
  totalSupply: string;
  decimals: number;
  creator: string;
  creatorBalance: string;
  holders: string;
  mintAuthority: string;
  lpLocked: string;
  verified: string;
  categories: string[];
  topHolders: Array<{
    address: string;
    percentage: number;
  }>;
  markets: Array<{
    name: string;
    address: string;
  }>;
  riskAnalysis: RiskAnalysis;
}

export interface MonorailCategoryTokens {
  address: string;
  balance: string;
  categories: string[];
  decimals: number;
  mon_per_token: string;
  mon_value: string;
  name: string;
  pconf: string;
  symbol: string;
  usd_per_token: string;
}