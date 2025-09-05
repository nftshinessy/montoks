import { useState, useEffect } from 'react';
import Logo from "../components/Logo";

interface NetworkStats {
  gasPrice: string;
  monPrice: string;
}

const Home = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNetworkStats = async () => {
    try {
      const API_BASE = '/api';
      const [gasPriceResponse, monPriceResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/gas-price`),
        fetch(`${API_BASE}/mon-price`)
      ]);

      let gasPrice = 'N/A';
      let monPrice = 'N/A';

      if (gasPriceResponse.status === 'fulfilled' && gasPriceResponse.value.ok) {
        const gasData = await gasPriceResponse.value.json();
        gasPrice = gasData.gasPrice;
      }

      if (monPriceResponse.status === 'fulfilled' && monPriceResponse.value.ok) {
        const priceData = await monPriceResponse.value.json();
        monPrice = priceData.price;
      }

      setNetworkStats({ gasPrice, monPrice });
    } catch (error) {
      console.error('Error fetching network stats:', error);
      setNetworkStats({ gasPrice: 'N/A', monPrice: 'N/A' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkStats();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchNetworkStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractAddress) {
      window.location.href = `/token/${contractAddress}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-white">
      {/* Network Stats - Positioned in top right corner */}
      <div className="fixed top-6 right-6 z-10">
        <div className="flex gap-4">
          {/* Gas Price */}
          <div className="group bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/30 hover:border-gray-600/50 rounded-lg px-4 py-2 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">
                Gas
              </div>
              <div className="text-sm font-mono text-gray-300 group-hover:text-white">
                {isLoading ? '...' : networkStats?.gasPrice || 'N/A'} 
                <span className="text-xs ml-1 text-gray-500 group-hover:text-gray-400">gwei</span>
              </div>
            </div>
          </div>

          {/* MON Price */}
          <div className="group bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/30 hover:border-gray-600/50 rounded-lg px-4 py-2 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">
                MON
              </div>
              <div className="text-sm font-mono text-gray-300 group-hover:text-white">
                ${isLoading ? '...' : networkStats?.monPrice || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        {/* Логотип с футуристичным стилем */}
        <div className="mx-auto mb-6 flex items-center justify-center">
  <Logo className="w-20 h-20" />
</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Montoks
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Advanced security scanner for tokens on the Monad network. Analyze contract risks, holder distribution, and liquidity safety.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/30 backdrop-blur-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="contract-address" className="block text-sm font-medium text-gray-300 mb-2">
              Enter Token Contract Address
            </label>
            <input
              type="text"
              id="contract-address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="e.g., 0x..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 glow"
          >
            Analyze Token
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Enter a valid Monad token contract address to analyze its security risks
          </p>
        </div>
      </div>

      {/* Features section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2 text-center">Security Audit</h3>
          <p className="text-sm text-gray-400 text-center">Comprehensive contract analysis to detect vulnerabilities and scam patterns</p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2 text-center">Holder Analysis</h3>
          <p className="text-sm text-gray-400 text-center">Detailed examination of token distribution and concentration risks</p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2 text-center">Liquidity Check</h3>
          <p className="text-sm text-gray-400 text-center">Verification of liquidity pool status and lock information</p>
        </div>
      </div>

      {/* Footer with X logo */}
      <footer className="mt-16 w-full max-w-4xl border-t border-gray-800 pt-8 pb-4">
        <div className="flex flex-col items-center">
          <a 
            href="https://x.com/nftshinessy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <p className="text-sm text-gray-500">Montoks - Monad Token Scanner</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;