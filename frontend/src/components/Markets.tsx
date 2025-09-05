interface Market {
  name: string;
  address: string;
}

interface MarketsProps {
  markets: Market[];
}

const Markets = ({ markets }: MarketsProps) => {
  if (!markets || markets.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Markets</h2>
        <p className="text-gray-400">No market data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Markets</h2>
      <div className="space-y-3">
        {markets.map((market, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-400">{market.name}</span>
            <a 
              href={`https://testnet.monadexplorer.com/address/${market.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-mono text-sm"
            >
              {market.address.slice(0, 6)}...{market.address.slice(-4)}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Markets;