/*global module,require*/

var util   = require('util');
var events = require('events');
var WebSocketClient = require('websocket').client;

var STREAM_BASE = 'wss://stream.pushbullet.com/websocket';

/**
 * Event emitter for the Pushbullet streaming API.
 *
 * @param {String}     apiKey PushBullet API key.
 * @param {Encryption} encryption Encryption instance.
 */
function Stream(apiKey, encryption) {
	var self = this;

	self.apiKey = apiKey;

	events.EventEmitter.call(self);

	self.client = new WebSocketClient();

	self.client.on('connectFailed', function(error) {
		self.emit('error', error);
	});

	self.client.on('connect', function(connection) {

		self.connection = connection;

		self.emit('connect');

		connection.on('error', function(error) {
			self.emit('error', error);
		});

		connection.on('close', function() {
			self.emit('close');
		});

		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				var data = JSON.parse(message.utf8Data);

				if(encryption && data.type === 'push' && data.push.encrypted) {
					var decipheredMessage = encryption.decrypt(data.push.ciphertext);
					data.push = JSON.parse(decipheredMessage);
				}

				self.emit('message', data);

				if (data.type === 'nop') {
					self.emit('nop');
				}
				else if (data.type === 'tickle') {
					self.emit('tickle', data.subtype);
				}
				else if (data.type === 'push') {
					self.emit('push', data.push);
				}
			}
		});
	});
}

util.inherits(Stream, events.EventEmitter);

module.exports = Stream;

/**
 * Connect to the stream.
 */
Stream.prototype.connect = function connect() {
	this.client.connect(STREAM_BASE + '/' + this.apiKey);
};

/**
 * Disconnect from the stream.
 */
Stream.prototype.close = function close() {
	this.connection.close();
};
