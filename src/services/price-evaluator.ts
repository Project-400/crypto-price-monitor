import { TradingPairPriceData } from '../models/symbol-price-data';
import { MarketAlgorithms } from '../utils/market-algorithms';
import { MarketPriceListener, SymbolPriceData } from '../listeners/market-price-listener';
import { SNSPublish } from '../sns-sqs/publish';
import { CurrencySuggestion } from '@crypto-tracker/common-types';

export class PriceEvaluator {

	private static isEvaluating: boolean = false;
	private static symbols: TradingPairPriceData[] = [];
	private static interval: NodeJS.Timeout;
	private static intervalDelay: number = 10000;
	// private static allowedQuotes: string[];
	// private static ignorePairs: string[];

	public static Start = (): void => {
		console.log('Evaluating Prices');
		PriceEvaluator.isEvaluating = true;

		PriceEvaluator.interval = setInterval(async (): Promise<void> => {
			await PriceEvaluator.evaluateChanges();
		}, PriceEvaluator.intervalDelay);
	}

	public static Stop = (): void => {
		console.log('Stopping Evaluating Prices');
		PriceEvaluator.isEvaluating = false;
		clearInterval(PriceEvaluator.interval);
	}

	private static evaluateChanges(): void {
		console.log('Evaluate Price Changes');

		PriceEvaluator.mapPriceData();
		const filteredSymbols: TradingPairPriceData[] = PriceEvaluator.filterOutPairs();

		let leaper: TradingPairPriceData | undefined;

		filteredSymbols.map((symbol: TradingPairPriceData): void => {
			leaper = MarketAlgorithms.findHighestRecentLeaper(symbol, leaper);
		});

		if (leaper && leaper.pricePercentageChanges.tenSeconds > 0) {
			const currencySuggestion: CurrencySuggestion = {
				symbol: leaper.symbol,
				suggestionTime: new Date().toISOString(),
				expirationTime: new Date(new Date().getTime() + 30000).toISOString(),
				percentageIncrease: leaper.pricePercentageChanges.tenSeconds,
				timePeriodAnalysis: '10'
			};

			SNSPublish.send(JSON.stringify(currencySuggestion));
		}
	}

	private static mapPriceData(): void {
		const currentSymbols: SymbolPriceData[] = MarketPriceListener.GetSymbols();

		currentSymbols.map((symbol: SymbolPriceData): void => {
			const existingTradeData: TradingPairPriceData | undefined =
				PriceEvaluator.symbols.find((s: TradingPairPriceData): boolean => s.symbol === symbol.symbol);
			if (existingTradeData) existingTradeData.updatePrice(Number(symbol.price));
			else PriceEvaluator.symbols.push(new TradingPairPriceData(symbol.symbol, Number(symbol.price)));
		});
	}

	private static filterOutPairs(): TradingPairPriceData[] {
		const allSymbols: TradingPairPriceData[] = PriceEvaluator.symbols;

		return allSymbols.filter((s: TradingPairPriceData): boolean =>  // TODO: Get this and store from Lambda
			!PriceEvaluator.isLeveraged(s.symbol) &&
			!PriceEvaluator.isTinyCurrency(s.symbol, s.prices.now - s.prices.sixtySeconds) &&
			PriceEvaluator.allowedQuotes(s.symbol)); // &&
			// !this.isIgnoredPair(s.symbol) &&
			// this.isAllowedQuote(s.symbol));
	}

	private static isTinyCurrency = (symbol: string, priceChange: number): boolean => { // USDT only temporarily
		if (symbol.endsWith('USDT') && priceChange < 0.0006) return true;
		if (symbol.endsWith('BTC') && priceChange < 0.00000005) return true;
		if (symbol.endsWith('ETH') && priceChange < 0.0000015) return true;
		return false;
	}

	private static isLeveraged = (symbol: string): boolean => symbol.includes('UP') || symbol.includes('DOWN');

	private static allowedQuotes = (symbol: string): boolean => symbol.endsWith('USDT');

}
