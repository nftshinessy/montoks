import { TokenData } from './types';

export const analyzeRisks = (tokenData: TokenData): TokenData['riskAnalysis'] => {
  const reasons: string[] = [];
  let score = 0;

  // 1. Проверка Mint Authority (25 баллов)
  if (tokenData.mintAuthority !== 'Revoked') {
    score += 25;
    reasons.push('Mint authority enabled - Owner can create unlimited tokens');
  }

  // 2. Проверка концентрации у топ-холдеров (30 баллов)
  if (tokenData.topHolders.length > 0) {
    const top10Ownership = tokenData.topHolders
      .slice(0, 10)
      .reduce((sum, holder) => sum + holder.percentage, 0);
    
    if (top10Ownership > 90) {
      score += 30;
      reasons.push(`Extreme concentration - Top 10 control ${top10Ownership.toFixed(2)}% of supply`);
    } else if (top10Ownership > 70) {
      score += 20;
      reasons.push(`High concentration - Top 10 control ${top10Ownership.toFixed(2)}% of supply`);
    }

    // Проверка владения одним холдером
    if (tokenData.topHolders[0] && tokenData.topHolders[0].percentage > 20) {
      score += 10;
      reasons.push(`Single holder dominance - Largest holder has ${tokenData.topHolders[0].percentage.toFixed(2)}%`);
    }
  }

  // 3. Проверка баланса создателя (20 баллов)
  if (tokenData.creatorBalance === 'SOLD') {
    score += 20;
    reasons.push('Creator sold all tokens - High abandonment risk');
  } else if (tokenData.creatorBalance !== 'No Data' && tokenData.creatorBalance !== 'Error') {
    const creatorPercentage = parseFloat(tokenData.creatorBalance.replace('%', ''));
    if (creatorPercentage < 2) {
      score += 15;
      reasons.push(`Low creator holding - Only ${tokenData.creatorBalance}`);
    }
  }

  // 4. Проверка LP Locked (15 баллов)
  if (!tokenData.lpLocked.includes('100') && !tokenData.lpLocked.includes('Yes')) {
    score += 15;
    reasons.push('Liquidity not locked - High rug pull risk');
  }

  // 5. Проверка верификации (10 баллов)
  if (tokenData.verified !== 'Verified') {
    score += 10;
    reasons.push('Token not verified - Higher scam risk');
  }

  // Ограничение score до 100
  const normalizedScore = Math.min(score, 100);

  // Определение уровня риска
  let level: 'Good' | 'Normal' | 'Danger' = 'Good';
  if (normalizedScore <= 30) {
    level = 'Good';
  } else if (normalizedScore <= 60) {
    level = 'Normal';
  } else {
    level = 'Danger';
  }

  // Добавляем пояснение о качестве оценки
  if (tokenData.creator === 'No Data' || tokenData.lpLocked === 'No Data') {
    reasons.push('Limited data available - Risk assessment may be incomplete');
  }

  return {
    score: normalizedScore,
    level,
    reasons,
  };
};