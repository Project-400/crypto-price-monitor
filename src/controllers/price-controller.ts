import { Request, Response } from 'express';
import { MarketPriceListener } from "../listeners/market-price-listener";
import {PriceEvaluator} from "../services/price-evaluator";

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

}

/*
* SNS / SQS code
* */

// AWS.config.update({
// 	region: 'eu-west-1',
// 	// accessKeyId: '...',
// 	// secretAccessKey: '...'
// });
//
// const app = Consumer.create({
// 	queueUrl: 'https://sqs.eu-west-1.amazonaws.com/068475715603/TestQ',
// 	handleMessage: async (message: SQSMessage) => {
// 		// do some work with `message`
// 		console.log(message);
// 	},
// 	sqs: new AWS.SQS({
// 		httpOptions: {
// 			agent: new https.Agent({
// 				keepAlive: true
// 			})
// 		}
// 	})
// });
//
// app.on('error', (err: Error) => {
// 	console.error(err.message);
// });
//
// app.on('processing_error', (err: Error) => {
// 	console.error(err.message);
// });
//
// app.start();
