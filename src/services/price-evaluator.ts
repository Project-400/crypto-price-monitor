import SocketConnection, { SocketMessage } from '../config/websocket/connector';
import { BinanceBookTickerStreamData, BinanceWebsocketSubscription } from '../interfaces/interfaces';
import { Logger } from '../config/logger/logger';
import { BINANCE_WS } from '../environment';
import { TradingPairPriceData } from '../models/symbol-price-data';
import {MarketAlgorithms} from "../utils/market-algorithms";
import {MarketPriceListener, SymbolPriceData} from "../listeners/market-price-listener";
import {SNSPublish} from "../sns-sqs/publish";

// export interface SymbolPriceData {
// 	symbol: string;
// 	lowercaseSymbol: string;
// 	price: string;
// 	priceNumerical: number;
// }

interface PerformersData {
	climber?: TradingPairPriceData,
	leaper?: TradingPairPriceData,
	highestGainer?: TradingPairPriceData,
	highestGain: number
}

export class PriceEvaluator {

	private static isEvaluating: boolean = false;
	// private static symbols: TradingPairPriceData[] = [];
	private static symbols: TradingPairPriceData[] = [];
	// private symbols: { [s: string]: SymbolPriceData } = { };
	private static interval: NodeJS.Timeout;
	private static intervalDelay: number = 10000;
	// private static allowedQuotes: string[];
	// private static ignorePairs: string[];

	public static Start = (): void => {
		console.log('Evaluating Prices');
		PriceEvaluator.isEvaluating = true;

		PriceEvaluator.interval = setInterval(async () => {
			await PriceEvaluator.evaluateChanges();
		}, PriceEvaluator.intervalDelay)
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

		let leaper: TradingPairPriceData | undefined = undefined;

		filteredSymbols.map((symbol: TradingPairPriceData) => {
			leaper = MarketAlgorithms.findHighestRecentLeaper(symbol, leaper);
		});

		console.log('Leaper ---------')
		console.log(leaper);

		SNSPublish.send(JSON.stringify(leaper));
	}

	private static mapPriceData(): void {
		const currentSymbols: SymbolPriceData[] = MarketPriceListener.GetSymbols();

		currentSymbols.map((symbol: SymbolPriceData): void => {
			const existingTradeData: TradingPairPriceData | undefined = this.symbols.find((s: TradingPairPriceData) => s.symbol === symbol.symbol);
			if (existingTradeData) existingTradeData.updatePrice(Number(symbol.price));
			else this.symbols.push(new TradingPairPriceData(symbol.symbol, Number(symbol.price)));
		});
	}

	private static filterOutPairs(): TradingPairPriceData[] {
		const allSymbols: TradingPairPriceData[] = PriceEvaluator.symbols;

		return allSymbols.filter((s: TradingPairPriceData): boolean =>  // TODO: Get this and store from Lambda
			!this.isLeveraged(s.symbol) &&
			!this.isTinyCurrency(s.symbol, s.prices.now - s.prices.sixtySeconds)); // &&
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

	// private isAllowedQuote = (symbol: string): boolean => !!PriceEvaluator.allowedQuotes.find((q: string): boolean => q === symbol);
	//
	// private isIgnoredPair = (symbol: string): boolean => !!PriceEvaluator.ignorePairs.find((p: string): boolean => p === symbol);

}
