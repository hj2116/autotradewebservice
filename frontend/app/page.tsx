'use client'

import { Box, Container, Heading, Text, VStack, Select, Button, Flex, FormControl, FormLabel, Input, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, SimpleGrid } from '@chakra-ui/react'
import { useState } from 'react'
import CandleChart from './components/CandleChart'



const AVAILABLE_TICKERS = [
  { value: 'KRW-BTC', label: '비트코인 (BTC)' },
  { value: 'KRW-ETH', label: '이더리움 (ETH)' },
  { value: 'KRW-XRP', label: '리플 (XRP)' },
  // 필요시 추가
];

const STRATEGY_OPTIONS = [
  { value: 'InverseVolatility', label: 'Inverse Volatility' },
  { value: 'Trend', label: 'Trend' },
  { value: 'CounterTrend', label: 'Counter Trend' },
  { value: 'Spread', label: 'Spread' }
]

const SMA_OPTIONS = [
  {value: "shortPeriod", label: "짧은 기간", type: "number", placeholder: "예: 5"},
  {value: "longPeriod", label: "긴 기간", type: "number", placeholder: "예: 20"}
];

const EMA_OPTIONS = [
  {value: "shortPeriod", label: "짧은 기간", type: "number", placeholder: "예: 5"},
  {value: "longPeriod", label: "긴 기간", type: "number", placeholder: "예: 20"}
];

const BREAKOUT_OPTIONS = [
  {value: "nDays", label: "N일", type: "number", placeholder: "예: 5"},
];

const STRATEGY_OPTION_FIELDS = {
  "Inverse Volatility": [
    { name: "numTickers", label: "티커 수", type: "number", placeholder: "예: 3" }
  ],
  "Trend": [
    {
      name: "trendType",
      label: "트렌드 방식",
      type: "select",
      options: [
        { value: "sma", label: "Simple Moving Average" },
        { value: "ema", label: "Exponential Moving Average" },
        { value: "breakout", label: "N Day Break Out" }
      ]
    }
  ],
  "CounterTrend": [
    { name: "kValue", label: "K 값", type: "number", placeholder: "예: 2.2" },
    { name: "nDays", label: "N 일", type: "number", placeholder: "예: 20" },
  ],
  "Spread": [
    {name: "ticker1", label: "티커1", type: "text", placeholder: "예: KRW-BTC"},
    {name: "ticker2", label: "티커2", type: "text", placeholder: "예: KRW-ETH"},
    {name: "maxHoldingPeriod", label: "최대 보유 기간", type: "number", placeholder: "예: 10"},
    {name: "enterLongSigma", label: "롱 진입 시그마 값", type: "number", placeholder: "예: 1"},
    {name: "enterShortSigma", label: "숏 진입 시그마 값", type: "number", placeholder: "예: -1"},
    {name: "exitLongSigma", label: "롱 종료 시그마 값", type: "number", placeholder: "예: -1"},
    {name: "exitShortSigma", label: "숏 종료 시그마 값", type: "number", placeholder: "예: 1"},
  ],
}

type StrategyKey = keyof typeof STRATEGY_OPTION_FIELDS;
type StrategyOptionField = (typeof STRATEGY_OPTION_FIELDS)[StrategyKey][number] & {
  options?: { value: string; label: string }[];
};

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState('KRW-BTC')
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>('Inverse Volatility')
  const [strategyOptions, setStrategyOptions] = useState<Record<string, string>>({})
  const [trendType, setTrendType] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const handleOptionChange = (name: string, value: string) => {
    setStrategyOptions(prev => ({ ...prev, [name]: value }));
    if (name === "trendType") setTrendType(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const strategy = selectedStrategy
    const options = strategyOptions
    let tickers = [];
    if(strategy === "Inverse Volatility") {
      const numTickers = Number(strategyOptions.numTickers);
       tickers = Array.from({ length: numTickers })
        .map((_, idx) => strategyOptions[`ticker${idx}`])
        .filter(Boolean);
    } else {
       tickers = [selectedTicker];
    }
    
    const volatility_window = Number(strategyOptions.volatilityPeriod) || 20;

    const response = await fetch(`http://localhost:8000/api/v1/trading/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy,
        options: {
          tickers,
          volatility_window,
          ...options
        }
      })
    });
    const result = await response.json();
    setResult(result);
    console.log(result);
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack gap={8} align="stretch">
        <Box>
          <Heading as="h1" size="2xl" mb={4}>
            Systematic Trading
          </Heading>
          <Text fontSize="xl" color="gray.600">
            자동화된 트레이딩 시스템
          </Text>
        </Box>
        <Flex gap={4} align="flex-start" direction={{ base: 'column', md: 'row' }}>
          {/* 왼쪽: 차트 */}
          <Box flex={1} minW={0}>
            <CandleChart ticker={selectedTicker} />
          </Box>
          {/* 옵션 영역: 한 박스에 모든 옵션 */}
          <Box
            minW={{ base: '100%', md: '500px' }}
            maxW="700px"
            width="100%"
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            p={6}
            maxH="80vh"
            overflowY="auto"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="bold">암호화폐 선택</Text>
                  <Select
                    value={selectedTicker}
                    onChange={(e) => setSelectedTicker(e.target.value)}
                  >
                    {AVAILABLE_TICKERS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text mb={2} fontWeight="bold">전략 선택</Text>
                  <Select
                    value={selectedStrategy}
                    onChange={(e) => {
                      setSelectedStrategy(e.target.value as StrategyKey);
                      setStrategyOptions({}); // 전략 변경 시 옵션 초기화
                      setTrendType(""); // 트렌드 전략 변경 시 트렌드 타입 초기화
                    }}
                  >
                    {STRATEGY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Box>
                <FormControl>
                  <FormLabel>변동성 계산 일수</FormLabel>
                  <Input
                    type="number"
                    placeholder="예: 20"
                    name="volatilityPeriod"
                    size="sm"
                    value={strategyOptions["volatilityPeriod"] || ""}
                    onChange={e => handleOptionChange("volatilityPeriod", e.target.value)}
                  />
                </FormControl>
                {/* 전략별 옵션 전체 렌더링 */}
                {STRATEGY_OPTION_FIELDS[selectedStrategy]?.map((field: StrategyOptionField) => (
                  <FormControl key={field.name}>
                    <FormLabel>{field.label}</FormLabel>
                    {field.type === "select" ? (
                      <Select
                        value={strategyOptions[field.name] || ""}
                        onChange={e => handleOptionChange(field.name, e.target.value)}
                        size="sm"
                      >
                        <option value="">선택</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={strategyOptions[field.name] || ""}
                        onChange={e => handleOptionChange(field.name, e.target.value)}
                        size="sm"
                      />
                    )}
                  </FormControl>
                ))}
                {selectedStrategy === "Trend" && (
                  <>
                    <FormControl>
                      <FormLabel>티커 개수</FormLabel>
                      <Input
                        type="number"
                        placeholder="예: 1"
                        name="numTickers"
                        size="sm"
                        value={strategyOptions["numTickers"] || ""}
                        onChange={e => handleOptionChange("numTickers", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>티커 선택</FormLabel>
                      <VStack spacing={2} align="stretch">
                        {Array.from({ length: Number(strategyOptions.numTickers) || 0 }).map((_, idx) => (
                          <Select
                            key={idx}
                            placeholder={`티커 #${idx + 1}`}
                            value={strategyOptions[`ticker${idx}`] || ""}
                            onChange={e => handleOptionChange(`ticker${idx}`, e.target.value)}
                            size="sm"
                          >
                            {AVAILABLE_TICKERS
                              .filter(t => !Object.values(strategyOptions).includes(t.value) || strategyOptions[`ticker${idx}`] === t.value)
                              .map(ticker => (
                                <option key={ticker.value} value={ticker.value}>{ticker.label}</option>
                              ))}
                          </Select>
                        ))}
                      </VStack>
                    </FormControl>
                  </>
                )}
                {selectedStrategy === "Trend" && trendType === "sma" && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {SMA_OPTIONS.map(opt => (
                      <FormControl key={opt.value}>
                        <FormLabel>{opt.label}</FormLabel>
                        <Input
                          type={opt.type}
                          placeholder={opt.placeholder}
                          value={strategyOptions[opt.value] || ""}
                          onChange={e => handleOptionChange(opt.value, e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                )}
                {selectedStrategy === "Trend" && trendType === "ema" && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {EMA_OPTIONS.map(opt => (
                      <FormControl key={opt.value}>
                        <FormLabel>{opt.label}</FormLabel>
                        <Input
                          type={opt.type}
                          placeholder={opt.placeholder}
                          value={strategyOptions[opt.value] || ""}
                          onChange={e => handleOptionChange(opt.value, e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                )}
                {selectedStrategy === "Trend" && trendType === "breakout" && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {BREAKOUT_OPTIONS.map(opt => (
                      <FormControl key={opt.value}>
                        <FormLabel>{opt.label}</FormLabel>
                        <Input
                          type={opt.type}
                          placeholder={opt.placeholder}
                          value={strategyOptions[opt.value] || ""}
                          onChange={e => handleOptionChange(opt.value, e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                )}
                {/* Inverse Volatility 전략일 때 티커 선택 Select 동적 렌더링 */}
                {selectedStrategy === "Inverse Volatility" && Number(strategyOptions.numTickers) > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>거래할 종목 선택</Text>
                    <VStack spacing={2} align="stretch">
                      {Array.from({ length: Number(strategyOptions.numTickers) }).map((_, idx) => (
                        <Select
                          key={idx}
                          placeholder={`티커 #${idx + 1}`}
                          value={strategyOptions[`ticker${idx}`] || ""}
                          onChange={e => handleOptionChange(`ticker${idx}`, e.target.value)}
                        >
                          {AVAILABLE_TICKERS
                            .filter(t => !Object.values(strategyOptions).includes(t.value) || strategyOptions[`ticker${idx}`] === t.value)
                            .map(ticker => (
                              <option key={ticker.value} value={ticker.value}>{ticker.label}</option>
                            ))}
                        </Select>
                      ))}
                    </VStack>
                  </Box>
                )}
                <Button type="submit" colorScheme="blue">
                  전략 시작
                </Button>
              </VStack>
            </form>
            {result && (
              <Box mt={6} p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>전략 결과</Text>
                {result.weights ? (
                  <VStack align="start" spacing={1}>
                    {Object.entries(result.weights).map(([ticker, weight]) => (
                      <Text key={ticker}>{ticker}: {(weight as number * 100).toFixed(2)}%</Text>
                    ))}
                  </VStack>
                ) : (
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                )}
              </Box>
            )}
          </Box>
        </Flex>
      </VStack>
    </Container>
  )
} 