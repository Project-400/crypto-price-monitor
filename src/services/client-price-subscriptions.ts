export class ClientPriceSubscriptions {

	public static subscribers: string[] = [];

	public static AddSub = (socketId: string): void => {
		console.log('Adding Price Subscriber');
		ClientPriceSubscriptions.subscribers.push(socketId);
	}

	public static RemoveSub = (socketId: string): void => {
		console.log('Removing Price Subscriber');
		console.log(ClientPriceSubscriptions.subscribers);

		const index: number = ClientPriceSubscriptions.subscribers.findIndex((s: string): boolean => s === socketId);
		if (index >= 0) {
			ClientPriceSubscriptions.subscribers.splice(index, 1);
		}

		console.log(ClientPriceSubscriptions.subscribers);
	}

}
