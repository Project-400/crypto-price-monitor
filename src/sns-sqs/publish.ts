import * as AWS from 'aws-sdk';

AWS.config.update({
	region: 'eu-west-1',
	// accessKeyId: '...',
	// secretAccessKey: '...'
});

export class SNSPublish {

	public static send = (message: string): void => {
		if (!message) throw Error('SNS message not sent - Message was empty');

		const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

		const params = {
			Message: message,
			TopicArn: 'arn:aws:sns:eu-west-1:068475715603:TestTopic'
		};

		sns.publish(params, (err, data) => {
			if (err) {
				console.error('Message Failed to Send')
				console.error(err, err.stack);
			} else {
				console.log('Message Sent')
				console.log(data);
			}
		});
	}

}
