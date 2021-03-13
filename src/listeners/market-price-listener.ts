import SocketConnection, { SocketMessage } from '../config/websocket/connector';
import { BinanceBookTickerStreamData, BinanceWebsocketSubscription } from "../interfaces/interfaces";
import { Logger } from '../config/logger/logger';
import { BINANCE_WS } from '../environment';

export interface SymbolPriceData {
	symbol: string;
	lowercaseSymbol: string;
	price: string;
	priceNumerical: number;
}

export class MarketPriceListener {

	private static binanceWsConnection?: SocketConnection;		// Websocket Connection to Binance
	public static isListening: boolean = false;					// Lowercase version of the symbol, eg. btcusdt
	private static symbols: SymbolPriceData[] = [];				// The symbol string, eg. BTCUSDT
	// private static prices: { [s: string]: string } = { };
	// private static symbols: { [s: string]: SymbolPriceData } = { };
	private static interval: NodeJS.Timeout;

	private static SubscribeToMarketPrices = (): void => {
		console.log('Subscribing To Market Prices')

		const subscriptionId: number = new Date().getMilliseconds();

		const data: BinanceWebsocketSubscription = {
			method: 'SUBSCRIBE',
			params: [ '!bookTicker' ],
			id: subscriptionId
		};

		MarketPriceListener.binanceWsConnection?.SendData(data);
	}

	private static UnsubscribeFromMarketPrices = (): void => {
		console.log('Unsubscribing To Market Prices')

		const subscriptionId: number = new Date().getMilliseconds();

		const data: BinanceWebsocketSubscription = {
			method: 'UNSUBSCRIBE',
			params: [ '!bookTicker' ],
			id: subscriptionId
		};

		MarketPriceListener.binanceWsConnection?.SendData(data);
	}

	private static GetSymbolPriceData = (symbol: string): SymbolPriceData | undefined => {
		let symbolPriceData: SymbolPriceData | undefined =
			MarketPriceListener.symbols.find((s: SymbolPriceData): boolean => s.symbol === symbol);
		return symbolPriceData;
	}

	// private static GetSymbolPriceDataById = (subscriptionId: number): SymbolPriceData | undefined =>
	// 	MarketPriceListener.symbols.find((s: SymbolPriceData): boolean => s.subscriptionId === subscriptionId)
	//
	// private static GetSymbolPriceDataIndex = (symbol: string): number =>
	// 	MarketPriceListener.symbols.findIndex((s: SymbolPriceData): boolean => s.symbol === symbol)

	// public static GetPrice = (symbol: string): string => MarketPriceListener.GetSymbolPriceData(symbol).price;
	//
	// public static GetPriceNumerical = (symbol: string): number => MarketPriceListener.GetSymbolPriceData(symbol).priceNumerical;

	private static UpdatePrice = (symbol: string, price: string): void => {
		// console.log('Update Price');

		let symbolPriceData: SymbolPriceData | undefined = MarketPriceListener.GetSymbolPriceData(symbol);
		if (!symbolPriceData) {
			symbolPriceData = {
				symbol,
				lowercaseSymbol: symbol.toLowerCase(),
				price: '0',
				priceNumerical: 0
			};

			MarketPriceListener.symbols.push(symbolPriceData);
		}

		symbolPriceData.price = price;
		symbolPriceData.priceNumerical = Number(price);
	}

	// private static PriceChange = (symbol: string, price: string): void => {
	// 	MarketPriceListener.prices[symbol] = price;
	// }

	public static StartListening = (): void => {
		Logger.info('Opening Connection to Binance WebSocket');

		MarketPriceListener.binanceWsConnection = new SocketConnection(
			BINANCE_WS,
			MarketPriceListener.SocketOpen,
			MarketPriceListener.SocketClose,
			MarketPriceListener.SocketMessage,
			MarketPriceListener.SocketError
		);

		// MarketPriceListener.isListening = true;
	}

	public static StopListening = (): SymbolPriceData[] => {
		MarketPriceListener.UnsubscribeFromMarketPrices();
		MarketPriceListener.binanceWsConnection?.Close();
		MarketPriceListener.binanceWsConnection = undefined;
		clearInterval(MarketPriceListener.interval);

		return MarketPriceListener.symbols;
	}

	private static SocketOpen = (): void => {
		Logger.info('Trader Bot connected to Binance WebSocket');
		MarketPriceListener.isListening = true;

		MarketPriceListener.SubscribeToMarketPrices();

		MarketPriceListener.interval = setInterval(async (): Promise<void> => {
			console.log(`Price Count: ${MarketPriceListener.symbols.length}`);
			// MarketPriceListener.updatePrices();
			// this.checks += 1;
			//
			// if (!this.inStartup) {
			// 	await this.evaluateChanges();
			// } else {
			// 	if (this.checks >= 6) this.inStartup = false;
			// 	Logger.info(`Starting up.. Gathering Data for ${60 - (this.checks * 10)} seconds`);
			// }
		}, 2000);
	}

	private static SocketClose = (): void => {
		Logger.info(`Trader Bot disconnected from Binance`);
		MarketPriceListener.isListening = false;
	}

	private static SocketMessage = (msg: SocketMessage): void => {
		const msgData: BinanceBookTickerStreamData = JSON.parse(msg.data as string);

		// MarketPriceListener.PriceChange(msgData.s, msgData.a); // TODO: Clarify whether to use msgData.a or msgData.b?
		if (msgData.result === null && msgData.id !== undefined) return;
		MarketPriceListener.UpdatePrice(msgData.s, msgData.a); // TODO: Clarify whether to use msgData.a or msgData.b?
	}

	private static SocketError = (): void => {
		Logger.info(`Trader Bot encountered an error while connected to Binance`);
	}

}
