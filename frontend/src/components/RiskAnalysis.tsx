interface RiskAnalysisProps {
  riskData: {
    score: number;
    level: 'Good' | 'Normal' | 'Danger';
    reasons: string[];
  };
}

const RiskAnalysis = ({ riskData }: RiskAnalysisProps) => {
  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'Good': return 'Low Risk';
      case 'Normal': return 'Medium Risk';
      case 'Danger': return 'High Risk';
      default: return level;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Good': return 'text-green-400';
      case 'Normal': return 'text-yellow-400';
      case 'Danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskLevelBg = (level: string) => {
    switch (level) {
      case 'Good': return 'bg-green-500/10';
      case 'Normal': return 'bg-yellow-500/10';
      case 'Danger': return 'bg-red-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const getProgressBarColor = (level: string) => {
    switch (level) {
      case 'Good': return 'bg-green-500';
      case 'Normal': return 'bg-yellow-500';
      case 'Danger': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Фильтруем reasons, чтобы показывать только важные
  const importantReasons = riskData.reasons.filter(reason => 
    !reason.includes('Good') && !reason.includes('Limited data available')
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Risk Assessment</h2>
      
      <div className={`${getRiskLevelBg(riskData.level)} p-4 rounded-lg mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Risk Score</span>
          <div className="flex items-center">
            <span className={`text-2xl font-bold ${getRiskLevelColor(riskData.level)}`}>
              {riskData.score}
            </span>
            <span className={`ml-2 ${getRiskLevelColor(riskData.level)}`}>
              /100 - {getRiskLevelText(riskData.level)}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
          <div 
            className={`h-2 rounded-full ${getProgressBarColor(riskData.level)}`}
            style={{ width: `${riskData.score}%` }}
          ></div>
        </div>
      </div>
      
      {importantReasons.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Key Risk Factors:</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {importantReasons.map((reason, index) => {
              // Определяем цвет в зависимости от содержания
              let textColor = 'text-gray-300';
              if (reason.includes('High') || reason.includes('Extreme') || reason.includes('Critical')) {
                textColor = 'text-red-400';
              } else if (reason.includes('Medium') || reason.includes('Moderate') || reason.includes('Warning')) {
                textColor = 'text-yellow-400';
              }
              
              return (
                <li key={index} className={`text-sm flex items-start ${textColor}`}>
                  <span className="min-w-[6px] max-w-[6px] min-h-[6px] max-h-[6px] bg-current rounded-full mt-2 mr-3"></span>
                  <span>{reason}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;