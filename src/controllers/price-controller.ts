import { Request, Response } from 'express';
import {MarketPriceListener} from "../listeners/market-price-listener";

export class PriceController {

	public static start = async (req: Request, res: Response): Promise<Response> => {
		MarketPriceListener.StartListening();

		return res.status(200).json({ success: true });
	}

	public static stop = async (req: Request, res: Response): Promise<Response> => {
		const symbols: any = MarketPriceListener.StopListening();

		return res.status(200).json({ success: true, symbols });
	}

}
