import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TokenOverview from '../components/TokenOverview';
import TopHolders from '../components/TopHolders';
import Markets from '../components/Markets';
import RiskAnalysis from '../components/RiskAnalysis';
import Logo from "../components/Logo";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  avatarUrl: string | null;
  price: number;
  priceMon: number;
  totalSupply: string;
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
  riskAnalysis: {
    score: number;
    level: 'Good' | 'Normal' | 'Danger';
    reasons: string[];
  };
}

const TokenAnalysis = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!contractAddress) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);
        
        const API_BASE = '/api';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        
        const response = await fetch(`${API_BASE}/token/${contractAddress}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: TokenData = await response.json();
        setTokenData(data);
        
        const hasCriticalErrors = data.name === 'Error' && data.symbol === 'Error' && data.totalSupply === 'Error';
        setHasError(hasCriticalErrors);
        
      } catch (err: any) {
        console.error('Error fetching token data:', err);
        setHasError(true);
        
        setTokenData({
          address: contractAddress,
          name: 'Error',
          symbol: 'Error',
          avatarUrl: null,
          price: 0,
          priceMon: 0,
          totalSupply: 'Error',
          creator: 'Error',
          creatorBalance: 'Error',
          holders: 'Error',
          mintAuthority: 'No Data',
          lpLocked: 'No Data',
          verified: 'Error',
          categories: [],
          topHolders: [],
          markets: [],
          riskAnalysis: {
            score: 0,
            level: 'Good',
            reasons: ['Unable to analyze token due to data fetch errors']
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [contractAddress]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shortenAddress = (address: string) => {
    if (!address || address === 'Error') return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderValue = (value: string | number, fallback = 'Error') => {
    if (value === 'Error' || value === undefined || value === null) {
      return <span className="text-red-400">{fallback}</span>;
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Analyzing token...</div>
          <div className="text-gray-400 text-sm mt-2">This may take up to 30 seconds</div>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="text-white text-xl mb-4 text-center">
          Failed to load token data
        </div>
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        
        <div className="flex items-center justify-center">
  <Logo className="w-10 h-10" />
</div>
      </div>

      {/* Error notification banner */}
      {hasError && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-amber-400 font-medium">Partial Data Available</h3>
              <p className="text-amber-200 text-sm mt-1">
                Some token data could not be retrieved. Fields showing "Error" indicate unavailable information.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
              {tokenData.avatarUrl ? (
                <img src={tokenData.avatarUrl} alt={tokenData.name} className="w-16 h-16 rounded-full" />
              ) : (
                <span className="text-2xl font-bold">
                  {tokenData.symbol !== 'Error' ? tokenData.symbol?.charAt(0) || 'T' : '?'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {renderValue(tokenData.name)} ({renderValue(tokenData.symbol)})
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-lg text-blue-400">${tokenData.price?.toFixed(7) || '0.0000000'}</p>
                <p className="text-lg text-purple-400">{tokenData.priceMon?.toFixed(7) || '0.0000000'} MON</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  tokenData.verified === 'Verified' ? 'bg-green-500/20 text-green-400' : 
                  tokenData.verified === 'Error' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {renderValue(tokenData.verified, 'Unverified')}
                </span>
              </div>
              
              {/* Категории в серых блоках */}
              {tokenData.categories && tokenData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tokenData.categories.map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
            <span className="text-sm font-mono">{shortenAddress(tokenData.address)}</span>
            <button
              onClick={() => copyToClipboard(tokenData.address)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy address"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TokenOverview data={tokenData} shortenAddress={shortenAddress} />
          <TopHolders holders={tokenData.topHolders} shortenAddress={shortenAddress} />
        </div>
        
        <div className="space-y-6">
          <RiskAnalysis riskData={tokenData.riskAnalysis} />
          <Markets markets={tokenData.markets} />
        </div>
      </div>

      <footer className="mt-16 max-w-7xl mx-auto border-t border-gray-800 pt-6">
        <div className="flex justify-center">
          <a 
            href="https://x.com/nftshinessy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default TokenAnalysis;