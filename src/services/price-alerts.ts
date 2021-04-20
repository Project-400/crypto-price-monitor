import { WebsocketProducer } from '../config/websocket/producer';
import { ClientPriceSubscriptions } from './client-price-subscriptions';

export interface PriceAlert {
	symbol: string;
	price: number;
	percentageDifference: number;
	time: string;
}

export class PriceAlerts {

	public static priceAlerts: PriceAlert[] = [
		{
			symbol: 'ALPHAUSDT',
			price: 2.65,
			percentageDifference: 1.93,
			time: new Date(new Date().getTime() - 270000).toISOString()
		},
		{
			symbol: 'SUSHIUSDT',
			price: 18.12,
			percentageDifference: 3.11,
			time: new Date(new Date().getTime() - 1110000).toISOString()
		}
	];

	public static AddAlert = (alert: PriceAlert): void => {
		console.log('Adding New Price Alert');
		PriceAlerts.priceAlerts.push(alert);

		WebsocketProducer.sendMultiple(JSON.stringify({
			priceAlert: {
				symbol: alert.symbol,
				price: alert.price,
				percentageIncrease: alert.percentageDifference
			}
		}), ClientPriceSubscriptions.subscribers);
	}

}
