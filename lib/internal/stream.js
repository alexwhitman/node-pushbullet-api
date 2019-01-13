/*global module,require*/

var util   = require('util');
var events = require('events');
var WebSocket = require('ws');

var STREAM_BASE = 'wss://stream.pushbullet.com/websocket';

/**
 * Event emitter for the Pushbullet streaming API.
 *
 * @param {String}     apiKey PushBullet API key.
 * @param {Encryption} encryption Encryption instance.
 */
function Stream(apiKey, encryption) {
	this.apiKey = apiKey;
	this.encryption = encryption;

	events.EventEmitter.call(this);
}

util.inherits(Stream, events.EventEmitter);

module.exports = Stream;

/**
 * Connect to the stream.
 */
Stream.prototype.connect = function connect() {
	var self = this;

	self.client = new WebSocket(STREAM_BASE + '/' + self.apiKey);

	self.client.on('open', function() {
		self.heartbeat();
		self.emit('connect');
	});

	self.client.on('close', function() {
		clearTimeout(this.pingTimeout);
		self.emit('close');
	});

	self.client.on('error', function(error) {
		self.emit('error', error);
	});

	self.client.on('message', function(message) {
		var data = JSON.parse(message);
		if (self.encryption && data.type === 'push' && data.push.encrypted) {
			var decipheredMessage = self.encryption.decrypt(data.push.ciphertext);
			data.push = JSON.parse(decipheredMessage);
		}
		self.emit('message', data);
		if (data.type === 'nop') {
			self.heartbeat();
			self.emit('nop');
		}
		else if (data.type === 'tickle') {
			self.emit('tickle', data.subtype);
		}
		else if (data.type === 'push') {
			self.emit('push', data.push);
		}
	});
};

/**
 * Disconnect from the stream.
 */
Stream.prototype.close = function close() {
	this.client.close();
};

/**
 * Reconnect to stream if a 'nop' message hasn't been seen for 30 seconds.
*/
Stream.prototype.heartbeat = function heartbeat() {
	var self = this;

	clearTimeout(self.pingTimeout);

	// Use `WebSocket#terminate()` and not `WebSocket#close()`. Delay is
	// equal to the interval at which the server sends 'nop' messages plus a
	// conservative assumption of the latency.
	self.pingTimeout = setTimeout(function() {
		self.client.terminate();
		self.connect();
	}, 30000 + 1000);
};
