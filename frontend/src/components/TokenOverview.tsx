interface OverviewData {
  totalSupply: string;
  creator: string;
  creatorBalance: string;
  holders: string;
  mintAuthority: string;
  lpLocked: string;
}

interface TokenOverviewProps {
  data: OverviewData;
  shortenAddress: (address: string) => string;
}

const TokenOverview = ({ data, shortenAddress }: TokenOverviewProps) => {
  const renderValue = (value: string, isError: boolean = false) => {
    if (value === 'Error') {
      return <span className="text-red-400">Error</span>;
    }
    if (value === 'No Data') {
      return <span className="text-gray-500">No Data</span>;
    }
    return <span className={isError ? "text-red-400" : "text-white"}>{value}</span>;
  };

  const renderCreatorLink = (address: string) => {
    if (address === 'Error' || address === 'No Data') {
      return renderValue(address);
    }
    
    return (
      <a 
        href={`https://testnet.monadexplorer.com/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-blue-400"
      >
        {shortenAddress(address)}
      </a>
    );
  };

  const renderCreatorBalance = (balance: string) => {
    if (balance === 'SOLD') {
      return <span className="text-red-400">SOLD</span>;
    }
    if (balance === 'Error') {
      return <span className="text-red-400">Error</span>;
    }
    if (balance === 'No Data') {
      return <span className="text-gray-500">No Data</span>;
    }
    return <span className="text-white">{balance}</span>;
  };

  const renderMintAuthority = (authority: string) => {
    if (authority === 'Revoked') {
      return <span className="text-green-400">Revoked</span>;
    }
    if (authority === 'Error') {
      return <span className="text-red-400">Error</span>;
    }
    if (authority === 'No Data') {
      return <span className="text-gray-500">No Data</span>;
    }
    return <span className="text-rose-400">{authority}</span>;
  };

  const renderLpLocked = (locked: string) => {
    if (locked === 'Error') {
      return <span className="text-red-400">Error</span>;
    }
    if (locked === 'No Data') {
      return <span className="text-gray-500">No Data</span>;
    }
    if (locked.includes('100')) {
      return <span className="text-green-400">{locked}</span>;
    }
    if (locked.includes('Yes')) {
      return <span className="text-yellow-400">{locked}</span>;
    }
    return <span className="text-rose-400">{locked}</span>;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Token Overview</h2>
      <dl className="space-y-3">
        <div className="flex justify-between">
          <dt className="text-gray-400">Total Supply</dt>
          <dd className="font-mono">{renderValue(data.totalSupply)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Creator</dt>
          <dd className="font-mono">
            {renderCreatorLink(data.creator)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Creator Balance</dt>
          <dd className="font-mono">{renderCreatorBalance(data.creatorBalance)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Holders</dt>
          <dd className="font-mono">{renderValue(data.holders)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Mint Authority</dt>
          <dd className="font-mono">{renderMintAuthority(data.mintAuthority)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">LP Locked</dt>
          <dd className="font-mono">{renderLpLocked(data.lpLocked)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default TokenOverview;