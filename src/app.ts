import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes';
import { MarketPriceListener } from './listeners/market-price-listener';
import { PriceEvaluator } from './services/price-evaluator';

const app: express.Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/v1', indexRouter);

MarketPriceListener.StartListening();
PriceEvaluator.Start();

app.listen(3011, '0.0.0.0', (): void => {
	console.log('Listening to port: ' + 3010);
});

export default app;
