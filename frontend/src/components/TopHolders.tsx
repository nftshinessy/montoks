interface Holder {
  address: string;
  percentage: number;
}

interface TopHoldersProps {
  holders: Holder[];
  shortenAddress: (address: string) => string;
}

const TopHolders = ({ holders, shortenAddress }: TopHoldersProps) => {
  if (!holders || holders.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Top Holders</h2>
        <p className="text-gray-400">No holder data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Top Holders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {holders.map((holder, index) => (
              <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-300">{index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-400">
                  <a 
                    href={`https://testnet.monadexplorer.com/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition-colors"
                  >
                    {shortenAddress(holder.address)}
                  </a>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-white">
                  {holder.percentage > 0 ? holder.percentage.toFixed(2) + '%' : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {holders.length > 0 && (
        <div className="mt-4 text-xs text-gray-400">
          Showing top {holders.length} holders
        </div>
      )}
    </div>
  );
};

export default TopHolders;