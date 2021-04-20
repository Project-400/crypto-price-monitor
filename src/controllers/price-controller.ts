import { Request, Response } from 'express';
import { MarketPriceListener } from '../listeners/market-price-listener';
import { PriceEvaluator } from '../services/price-evaluator';
import { PriceAlert, PriceAlerts } from '../services/price-alerts';

export class PriceController {

	public static start = async (req: Request, res: Response): Promise<Response> => {
		MarketPriceListener.StartListening();
		PriceEvaluator.Start();

		return res.status(200).json({ success: true });
	}

	public static stop = async (req: Request, res: Response): Promise<Response> => {
		PriceEvaluator.Stop();
		const symbols: any = MarketPriceListener.StopListening();

		return res.status(200).json({ success: true, symbols });
	}

	public static priceAlerts = async (req: Request, res: Response): Promise<Response> => {
		const priceAlerts: PriceAlert[] = PriceAlerts.priceAlerts;

		return res.status(200).json({ success: true, priceAlerts });
	}

}
