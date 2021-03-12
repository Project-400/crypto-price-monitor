import { Request, Response } from 'express';

export class PriceController {

	public static start = async (req: Request, res: Response): Promise<Response> => {
		return res.status(200).json({ success: true });
	}

}
