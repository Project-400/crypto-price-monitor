import dotenv from 'dotenv';

dotenv.config();

export const BINANCE_WS: string = process.env.BINANCE_WS as string;

export const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID as string;
export const AWS_REGION: string = process.env.AWS_REGION as string;
export const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY_ID: string = process.env.AWS_SECRET_ACCESS_KEY_ID as string;

export const AWS_PRICE_SUGGESTIONS_SNS_TOPIC: string = process.env.AWS_PRICE_SUGGESTIONS_SNS_TOPIC as string;
