import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes';
import { WebsocketProducer } from './config/websocket/producer';

const app: express.Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/v1', indexRouter);

WebsocketProducer.setup(app);

app.listen(3001, '0.0.0.0', (): void => {
	console.log('Listening to port: ' + 3000);
});

export default app;