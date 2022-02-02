import events    from 'events';
import WebSocket from 'ws';

const STREAM_BASE = 'wss://stream.pushbullet.com/websocket';

/**
 * Event emitter for the Pushbullet streaming API.
 */
export default class Stream extends events.EventEmitter {
	/**
	 *
	 * @param {String}     apiKey PushBullet API key.
	 * @param {Encryption} encryption Encryption instance.
	 */
	constructor(apiKey, encryption) {
		super();

		this.apiKey = apiKey;
		this.encryption = encryption;
	}

	/**
	 * Connect to the stream.
	 */
	connect() {
		this.client = new WebSocket(STREAM_BASE + '/' + this.apiKey);

		this.client.on('open', () => {
			this.heartbeat();
			this.emit('connect');
		});

		this.client.on('close', () => {
			clearTimeout(this.pingTimeout);
			this.emit('close');
		});

		this.client.on('error', (error) => {
			this.emit('error', error);
		});

		this.client.on('message', (message) => {
			const data = JSON.parse(message);
			if (this.encryption && data.type === 'push' && data.push.encrypted) {
				const decipheredMessage = this.encryption.decrypt(data.push.ciphertext);
				data.push = JSON.parse(decipheredMessage);
			}
			this.emit('message', data);
			if (data.type === 'nop') {
				this.heartbeat();
				this.emit('nop');
			}
			else if (data.type === 'tickle') {
				this.emit('tickle', data.subtype);
			}
			else if (data.type === 'push') {
				this.emit('push', data.push);
			}
		});
	}

	/**
	 * Disconnect from the stream.
	 */
	close() {
		this.client.close();
	}

	/**
	 * Reconnect to stream if a 'nop' message hasn't been seen for 30 seconds.
	 */
	heartbeat() {
		clearTimeout(this.pingTimeout);

		// Use `WebSocket#terminate()` and not `WebSocket#close()`. Delay is
		// equal to the interval at which the server sends 'nop' messages plus a
		// conservative assumption of the latency.
		this.pingTimeout = setTimeout(() => {
			this.client.terminate();
			this.connect();
		}, 30000 + 1000);
	}
}
