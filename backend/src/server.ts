import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { getFromCache, setCache } from './cache';
import { analyzeRisks } from './riskAnalysis';
import {
  MonorailTokenData,
  BlockvisionTokenDetail,
  BlockvisionTokenHolders,
  TokenData,
  MonorailCategoryTokens
} from './types';

// Загрузка переменных окружения
import dotenv from 'dotenv';
dotenv.config();

/**
 * Получает адрес создателя токена через Etherscan API
 */
async function getCreatorAddress(contractAddress: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=10143&module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=YOUR_API_KEY`
    );

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== '1' || !data.result || data.result.length === 0) {
      console.warn('Creator address not found in Etherscan response:', data.message);
      return 'No Data';
    }

    // Etherscan возвращает массив результатов, берем первый элемент
    return data.result[0].contractCreator;
  } catch (error) {
    console.error('Error fetching creator address from Etherscan:', error);
    return 'No Data';
  }
}

/**
 * Находит баланс создателя среди холдеров
 */
function findCreatorBalance(creatorAddress: string, holders: Array<{ address: string; percentage: number }>): { balance: string } {
  if (!creatorAddress || creatorAddress === 'Error' || creatorAddress === 'No Data') {
    return { balance: 'No Data' };
  }

  const creatorHolder = holders.find(holder => 
    holder.address.toLowerCase() === creatorAddress.toLowerCase()
  );

  if (!creatorHolder) {
    return { balance: 'SOLD' };
  }

  return { balance: `${creatorHolder.percentage.toFixed(2)}%` };
}

/**
 * Безопасное выполнение асинхронной функции с обработкой ошибок
 */
async function safeAsync<T>(fn: () => Promise<T>, defaultValue: T, errorMessage: string): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn(errorMessage, error);
    return defaultValue;
  }
}

/**
 * Получает общее количество холдеров токена через все страницы
 */
async function getTotalHoldersCount(contractAddress: string): Promise<{
  totalHolders: number;
  topHolders: Array<{ address: string; percentage: number; }>;
}> {
  let totalHolders = 0;
  let topHolders: Array<{ address: string; percentage: number; }> = [];
  let pageIndex = 1;
  let hasMorePages = true;

  try {
    console.log(`Начинаем подсчет холдеров для токена: ${contractAddress}`);

    while (hasMorePages) {
      const url = `${process.env.BLOCKVISION_API_BASE}/token/holders?contractAddress=${contractAddress}&pageIndex=${pageIndex}&pageSize=50`;
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.BLOCKVISION_API_KEY || ''
        }
      });

      if (!response.ok) {
        console.warn(`Failed to fetch page ${pageIndex}, stopping pagination`);
        break;
      }

      const data: BlockvisionTokenHolders = await response.json();
      
      if (data.code !== 0 || !data.result?.data) {
        console.warn(`Invalid response on page ${pageIndex}, stopping pagination`);
        break;
      }

      const holdersOnCurrentPage = data.result.data.length;
      totalHolders += holdersOnCurrentPage;

      if (pageIndex === 1) {
        topHolders = data.result.data.slice(0, 10).map((holder: any) => ({
          address: holder.holder || holder.accountAddress || holder.address || 'Unknown',
          percentage: typeof holder.percentage === 'string' ? parseFloat(holder.percentage) : holder.percentage || 0
        }));
      }

      if (holdersOnCurrentPage < 50) {
        hasMorePages = false;
      } else {
        hasMorePages = data.result.nextPageIndex ? data.result.nextPageIndex > pageIndex : false;
      }

      pageIndex++;

      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (pageIndex > 1000) {
        console.warn('Reached maximum page limit (1000), stopping pagination');
        break;
      }
    }

    console.log(`Подсчет завершен. Всего найдено холдеров: ${totalHolders}`);
    return { totalHolders, topHolders };

  } catch (error) {
    console.error('Error fetching total holders count:', error);
    return { totalHolders: 0, topHolders: [] };
  }
}

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://montoks.xyz', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// API конфигурация
const MONORAIL_API_BASE = 'https://testnet-api.monorail.xyz/v1';
const BLOCKVISION_API_BASE = process.env.BLOCKVISION_API_BASE || 'https://api.blockvision.org/v2/monad';
const BLOCKVISION_API_KEY = process.env.BLOCKVISION_API_KEY || '';
const MONORAIL_IDENTIFIER = process.env.MONORAIL_IDENTIFIER || '';
const QUICKNODE_RPC_URL = process.env.QUICKNODE_RPC_URL || '';

// Новый эндпоинт для получения цены газа
app.get('/api/gas-price', async (req: Request, res: Response) => {
  try {
    const response = await fetch(QUICKNODE_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`QuickNode API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    // Конвертируем из hex в gwei (1 gwei = 10^9 wei)
    const gasPriceWei = parseInt(data.result, 16);
    const gasPriceGwei = gasPriceWei / 1e9;

    res.json({ 
      gasPrice: gasPriceGwei.toFixed(2),
      gasPriceWei: gasPriceWei.toString()
    });
  } catch (error) {
    console.error('Error fetching gas price:', error);
    res.status(500).json({ error: 'Failed to fetch gas price' });
  }
});

// Новый эндпоинт для получения цены MON в USD
app.get('/api/mon-price', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${MONORAIL_API_BASE}/symbol/MONUSD`);
    
    if (!response.ok) {
      throw new Error(`Monorail API error: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({ 
      price: parseFloat(data.price || '0').toFixed(4)
    });
  } catch (error) {
    console.error('Error fetching MON price:', error);
    res.status(500).json({ error: 'Failed to fetch MON price' });
  }
});

// Эндпоинт для получения данных токена
app.get('/api/token/:contractAddress', async (req: Request, res: Response) => {
  try {
    const { contractAddress } = req.params;
    
    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return res.status(400).json({ error: 'Invalid contract address format' });
    }

    const cachedData = getFromCache(contractAddress);
    if (cachedData) {
      return res.json(cachedData);
    }

    console.log(`Анализируем токен: ${contractAddress}`);

    // Получаем данные параллельно
    const [monorailData, detailData, creatorAddress, { totalHolders, topHolders }] = await Promise.all([
      // Monorail API
      safeAsync(async () => {
        const response = await fetch(`${MONORAIL_API_BASE}/token/${contractAddress}`, {
          headers: { 'X-Public-Identifier': MONORAIL_IDENTIFIER }
        });
        return response.ok ? await response.json() : {};
      }, {} as MonorailTokenData, 'Monorail API failed'),

      // Blockvision Detail API  
      safeAsync(async () => {
        const response = await fetch(`${BLOCKVISION_API_BASE}/token/detail?address=${contractAddress}`, {
          headers: {
            'accept': 'application/json',
            'x-api-key': BLOCKVISION_API_KEY
          }
        });
        return response.ok ? await response.json() : { code: -1, reason: '', message: '' };
      }, { code: -1, reason: '', message: '' } as BlockvisionTokenDetail, 'Blockvision Detail API failed'),

      // Etherscan API для получения создателя
      safeAsync(() => getCreatorAddress(contractAddress), 'No Data', 'Etherscan API failed'),

      // Holders count
      safeAsync(() => getTotalHoldersCount(contractAddress), { totalHolders: 0, topHolders: [] }, 'Holders count failed')
    ]);

    // Определяем базовые данные
    const decimals = detailData.result?.decimals || 18;
    const rawTotalSupply = detailData.result?.totalSupply || monorailData.totalSupply || '0';

    // Форматируем totalSupply
    const formatSupplyWithDecimals = (supply: string, decimals: number): string => {
      try {
        const bigSupply = BigInt(supply);
        const divisor = BigInt(10) ** BigInt(decimals);
        const wholePart = bigSupply / divisor;
        const fractionalPart = bigSupply % divisor;
        
        if (fractionalPart === 0n) {
          return wholePart.toString();
        }
        
        let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        fractionalStr = fractionalStr.replace(/0+$/, '');
        
        return `${wholePart}.${fractionalStr}`;
      } catch (e) {
        console.error('Error formatting supply:', e);
        return 'Error';
      }
    };

    const formattedSupply = formatSupplyWithDecimals(rawTotalSupply, decimals);

    // Определяем баланс создателя
    const creatorBalance = creatorAddress !== 'No Data' 
      ? findCreatorBalance(creatorAddress, topHolders).balance 
      : 'No Data';

    // Формируем итоговые данные
    const tokenData: TokenData = {
      address: contractAddress,
      name: detailData.result?.name || monorailData.name || 'Error',
      symbol: detailData.result?.symbol || monorailData.symbol || 'Error',
      avatarUrl: detailData.result?.logo || null,
      price: parseFloat(monorailData.usd_per_token || '0'),
      priceMon: parseFloat(monorailData.mon_per_token || '0'),
      totalSupply: formattedSupply,
      decimals: decimals,
      creator: creatorAddress,
      creatorBalance: creatorBalance,
      holders: totalHolders > 0 ? totalHolders.toString() : 'Error',
      mintAuthority: 'No Data',
      lpLocked: 'No Data',
      verified: detailData.result?.verified ? 'Verified' : 'Unverified',
      categories: monorailData.categories || [],
      topHolders: topHolders,
      markets: [],
      riskAnalysis: {
        score: 0,
        level: 'Good',
        reasons: []
      }
    };

    // Анализ рисков
    tokenData.riskAnalysis = analyzeRisks(tokenData);

    // Сохраняем в кэш
    setCache(contractAddress, tokenData);

    console.log(`Анализ завершен. Создатель: ${creatorAddress}, Баланс создателя: ${creatorBalance}, Risk score: ${tokenData.riskAnalysis.score}/100`);
    res.json(tokenData);
    
  } catch (error) {
    console.error('Critical error in token analysis:', error);
    
    const errorTokenData: TokenData = {
      address: req.params.contractAddress,
      name: 'Error',
      symbol: 'Error', 
      avatarUrl: null,
      price: 0,
      priceMon: 0,
      totalSupply: 'Error',
      decimals: 18,
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
    };
    
    res.json(errorTokenData);
  }
});

// Эндпоинт для получения токенов по категории через Monorail API
app.get('/api/tokens/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { address } = req.query;

    if (!['wallet', 'verified', 'stable', 'lst', 'bridged', 'meme'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const url = address 
      ? `${MONORAIL_API_BASE}/tokens/category/${category}?address=${address}`
      : `${MONORAIL_API_BASE}/tokens/category/${category}`;

    const response = await fetch(url, {
      headers: { 'X-Public-Identifier': MONORAIL_IDENTIFIER }
    });

    if (!response.ok) {
      throw new Error(`Monorail API error: ${response.status}`);
    }

    const data: MonorailCategoryTokens[] = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching tokens by category:', error);
    res.status(500).json({ error: 'Failed to fetch tokens by category' });
  }
});

// Прокси для Blockvision API - Token Holders
app.get('/api/blockvision/token/:address/holders', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    const url = `${BLOCKVISION_API_BASE}/token/holders?contractAddress=${address}&pageIndex=${page}&pageSize=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': BLOCKVISION_API_KEY
      }
    });
    
    const data: BlockvisionTokenHolders = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Blockvision token holders error:', error);
    res.status(500).json({ error: 'Failed to fetch token holders' });
  }
});

// Прокси для Blockvision API - Token Detail
app.get('/api/blockvision/token/:address/detail', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const url = `${BLOCKVISION_API_BASE}/token/detail?address=${address}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': BLOCKVISION_API_KEY
      }
    });
    
    const data: BlockvisionTokenDetail = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Blockvision token detail error:', error);
    res.status(500).json({ error: 'Failed to fetch token detail' });
  }
});

// Прокси для Blockvision API - Token Gating
app.get('/api/blockvision/token/gating', async (req: Request, res: Response) => {
  try {
    const { accountAddress, tokenAddress } = req.query;
    
    if (!accountAddress || !tokenAddress) {
      return res.status(400).json({ error: 'Missing accountAddress or tokenAddress parameters' });
    }
    
    const url = `${BLOCKVISION_API_BASE}/token/gating?accountAddress=${accountAddress}&tokenAddress=${tokenAddress}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': BLOCKVISION_API_KEY
      }
    });
    
    const data: BlockvisionTokenHolders = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Blockvision token gating error:', error);
    res.status(500).json({ error: 'Failed to fetch token gating data' });
  }
});

// Эндпоинт для получения общего количества холдеров отдельно
app.get('/api/token/:contractAddress/holders/count', async (req: Request, res: Response) => {
  try {
    const { contractAddress } = req.params;
    
    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return res.status(400).json({ error: 'Invalid contract address format' });
    }

    const { totalHolders } = await getTotalHoldersCount(contractAddress);
    
    res.json({ totalHolders });
  } catch (error) {
    console.error('Error fetching holders count:', error);
    res.status(500).json({ error: 'Failed to fetch holders count' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});