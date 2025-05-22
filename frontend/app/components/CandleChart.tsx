"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Text, Select, HStack, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  XAxis,
  YAxis,
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  EdgeIndicator,
  discontinuousTimeScaleProvider,
  last,
} from "react-financial-charts";

interface CandleData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleChartProps {
  ticker: string;
}

const CANDLE_OPTIONS = [
  { value: "days", label: "일봉" },
  { value: "minutes/60", label: "1시간봉" },
  { value: "minutes/5", label: "5분봉" },
  { value: "minutes/1", label: "1분봉" },
  { value: "minutes/3", label: "3분봉" },
  { value: "minutes/5", label: "5분봉" },
  { value: "minutes/10", label: "10분봉" },
  { value: "minutes/30", label: "30분봉" },
  { value: "minutes/240", label: "4시간봉" },
];

const STRATEGY_OPTIONS = [
  { value: 'InverseVolatility', label: 'Inverse Volatility' },
  { value: 'Trend', label: 'Trend' },
  { value: 'CounterTrend', label: 'Counter Trend' },
  { value: 'Spread', label: 'Spread' }
] as const;

const TREND_METHOD_OPTIONS = [
  { value: "sma", label: "Simple Moving Average" },
  { value: "ema", label: "Exponential Moving Average" },
  { value: "nDayBreakout", label: "N Day Break Out" },
] as const;

const TREND_METHOD_FIELDS = {
  sma: [
    { name: "shortPeriod", label: "짧은 평균 기간", type: "number", placeholder: "예: 5" },
    { name: "longPeriod", label: "긴 기간", type: "number", placeholder: "예: 20" } 
  ],
  ema: [
    { name: "period", label: "이동평균 기간", type: "number", placeholder: "예: 10" },
    { name: "entryRatio", label: "진입 비율", type: "number", placeholder: "예: 0.1" },
    { name: "emaAlpha", label: "EMA 알파값", type: "number", placeholder: "예: 0.2" },
  ],
  nDayBreakout: [
    { name: "n", label: "N(일)", type: "number", placeholder: "예: 20" },
    { name: "entryRatio", label: "진입 비율", type: "number", placeholder: "예: 0.1" },
  ],
} as const;

function CandleChart({ ticker }: CandleChartProps) {
  const [data, setData] = useState<CandleData[]>([]);
  const [candleType, setCandleType] = useState("days");
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [strategyOptions, setStrategyOptions] = useState({});
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>(STRATEGY_OPTIONS[0].value);
  const [trendMethod, setTrendMethod] = useState("sma");
  const [trendMethodOptions, setTrendMethodOptions] = useState({});

  useEffect(() => {
    if (!chartRef.current) return;
    const handleResize = () => {
      setContainerWidth(chartRef.current!.offsetWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/api/v1/market/candles?unit=${candleType}&market_code=${ticker}&count=50`
      );
      const raw = await res.json();
      const parsed = raw
        .map((item: any) => ({
          date: new Date(item.candle_date_time_kst),
          open: item.opening_price,
          high: item.high_price,
          low: item.low_price,
          close: item.trade_price,
          volume: item.candle_acc_trade_volume,
        }))
        .reverse();
      setData(parsed);
      setLoading(false);
    };
    fetchCandles();
  }, [ticker, candleType]);

  const height = 400;
  const margin = { left: 90, right: 50, top: 10, bottom: 30 };
  const ratio = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
    (d: CandleData) => d.date
  );
  const { data: chartData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);
  const start = xAccessor(last(chartData));
  const end = xAccessor(chartData[Math.max(0, chartData.length - 50)]);
  const xExtents = [end, start];

  const handleOptionChange = (name: string, value: string) => {
    setStrategyOptions(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box ref={chartRef} w="100%" h="440px" bg="white" borderRadius="lg" boxShadow="md" p={0}>
      <Flex justify="space-between" align="center" px={6} pt={4} pb={2}>
        <Text fontSize="lg" fontWeight="bold">{ticker} 캔들 차트</Text>
        <Select
          w="120px"
          value={candleType}
          onChange={e => setCandleType(e.target.value)}
          size="sm"
        >
          {CANDLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </Flex>
      {loading || data.length === 0 ? (
        <Box display="flex" alignItems="center" justifyContent="center" h="360px">
          <Text>데이터를 불러오는 중...</Text>
        </Box>
      ) : (
        <ChartCanvas
          height={360}
          width={containerWidth}
          ratio={ratio}
          margin={margin}
          data={chartData}
          xScale={xScale}
          xAccessor={xAccessor}
          displayXAccessor={displayXAccessor}
          xExtents={xExtents}
          seriesName="CandleSeries"
        >
          <Chart id={1} yExtents={(d: CandleData) => [d.high, d.low]}>
            <XAxis />
            <YAxis axisAt="left" orient="left" />
            <MouseCoordinateX displayFormat={d => d && d.toLocaleDateString ? d.toLocaleDateString() : String(d)} />
            <MouseCoordinateY displayFormat={d => d && d.toLocaleString ? d.toLocaleString() : String(d)} />
            <CandlestickSeries />
          </Chart>
          <CrossHairCursor />
        </ChartCanvas>
      )}
      {selectedStrategy === "Trend" && (
        <>
          <FormControl mb={2}>
            <FormLabel>트렌드 방식</FormLabel>
            <Select
              value={trendMethod}
              onChange={e => setTrendMethod(e.target.value)}
              size="sm"
            >
              {TREND_METHOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </FormControl>
          {TREND_METHOD_FIELDS[trendMethod].map(field => (
            <FormControl key={field.name} mb={2}>
              <FormLabel>{field.label}</FormLabel>
              <Input
                type={field.type}
                placeholder={field.placeholder}
                value={trendMethodOptions[field.name] || ""}
                onChange={e =>
                  setTrendMethodOptions(prev => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                size="sm"
              />
            </FormControl>
          ))}
        </>
      )}
    </Box>
  );
}

export default CandleChart; 