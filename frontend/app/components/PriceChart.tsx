'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Text } from '@chakra-ui/react';

interface PriceData {
  timestamp: string;
  price: number;
}

interface PriceChartProps {
  ticker: string;
}

export default function PriceChart({ ticker }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/market/price/${ticker}`);
        const data = await response.json();
        
        // 데이터가 배열이 아닌 경우 배열로 변환
        const dataArray = Array.isArray(data) ? data : [data];
        
        // 데이터 형식 변환
        const formattedData = dataArray.map((item: any) => ({
          timestamp: new Date(item.trade_timestamp).toLocaleTimeString(),
          price: Number(item.trade_price)
        }));
        
        setPriceData(prevData => {
          const newData = [...prevData, ...formattedData];
          // 최대 100개의 데이터 포인트만 유지
          return newData.slice(-100);
        });
      } catch (error) {
        console.error('가격 데이터를 가져오는데 실패했습니다:', error);
      }
    };

    fetchPriceData();
    // 1초마다 데이터 업데이트
    const interval = setInterval(fetchPriceData, 1000);

    return () => clearInterval(interval);
  }, [ticker]);

  return (
    <Box w="100%" h="440px" bg="white" borderRadius="lg" boxShadow="md" p={4}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>{ticker} 캔들 차트</Text>
      {priceData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={priceData}
            margin={{ top: 10, right: 10, left: 60, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis domain={['auto', 'auto']} width={70} orientation="left" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              dot={false}
              isAnimationActive={false}
              name="가격"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text>데이터를 불러오는 중...</Text>
        </Box>
      )}
    </Box>
  );
} 