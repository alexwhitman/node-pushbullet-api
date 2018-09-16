/*global module,require*/

var http    = require('http');
var request = require('request-promise-native');

var Encryption = require('./internal/encryption');
var Stream = require('./internal/stream');

/**
 * PushBullet API abstraction module.
 *
 * @param {String} apiKey PushBullet API key.
 * @param {Object} options Options object.
 */
function PushBullet(apiKey, options) {
	if ( ! apiKey) {
		throw new Error('API Key is required');
	}

	this.apiKey = apiKey;

	var defaultOptions = {
		fullResponses : false
	};
	this.options = Object.assign({}, defaultOptions, options || {});

	this.request = request.defaults({
		headers: {
			'Access-Token': apiKey
		},
		json: true,
		simple: false,
		resolveWithFullResponse: true
	});
}

PushBullet.API_BASE = 'https://api.pushbullet.com/v2';
PushBullet.DEVICES_END_POINT  = PushBullet.API_BASE + '/devices';
PushBullet.PUSH_END_POINT     = PushBullet.API_BASE + '/pushes';
PushBullet.UPLOAD_END_POINT   = PushBullet.API_BASE + '/upload-request';
PushBullet.USERS_END_POINT    = PushBullet.API_BASE + '/users';
PushBullet.SUBS_END_POINT     = PushBullet.API_BASE + '/subscriptions';
PushBullet.CHANNELS_END_POINT = PushBullet.API_BASE + '/channel-info';
PushBullet.CHATS_END_POINT    = PushBullet.API_BASE + '/chats';
PushBullet.EPHEMERALS_END_POINT = PushBullet.API_BASE + '/ephemerals';

module.exports = PushBullet;

/**
 * Enables End-to-End encryption.
 *
 * @param {String} encryptionPassword End-to-End encryption password set by the user.
 * @param {String} userIden           The iden of the user (aquired e.g. by the /me request).
 */
PushBullet.prototype.enableEncryption = function enableEncryption(encryptionPassword, userIden) {
	this.encryption = new Encryption(encryptionPassword, userIden);
};

/**
 * Return a new stream listener.
 *
 * @return {Stream} Stream listener.
 */
PushBullet.prototype.stream = function stream() {
	return new Stream(this.apiKey, this.encryption);
};

/**
 * Performs a GET request to an end point.
 *
 * Options passed are added to the end point as a query string.
 *
 * @param  {String}   endPoint URL to send GET request to.
 * @param  {Object}   options  Key/value options used as query string parameters.
 * @param  {Function} callback Called when the request is complete.
 * @returns {Thenable}
 */
PushBullet.prototype.getList = function getList(endPoint, options, callback) {
	if (!callback && typeof options === 'function') {
		callback = options;
	}

	options = options ? options : {};

	var parameters = {};

	var optionKeys = Object.keys(options);

	if (optionKeys.length > 0) {
		parameters.qs = {};

		optionKeys.forEach(function(key) {
			parameters.qs[key] = options[key];
		});
	}

	return this.makeRequest('get', endPoint, parameters, callback);
};

/**
 * A wrapper around making a request that handles callbacks and promises
 *
 * @param {String} verb The http verb that is being made
 * @param {String} endPoint The api endpoint
 * @param {Object} options The options to be sent with the request
 * @param {Function} callback The optional callback
 * @returns {Promise}
 */
PushBullet.prototype.makeRequest = function makeRequest(verb, endPoint, options, callback) {
	return new Promise(resolve => {
		this.request[verb](endPoint, options).then(response => {
			resolve(this.handleResponse(response, callback));
		}).catch(err => {
			return this.handleError(err, null, callback);
		});
	});
};

/**
 * Handle the API request responses.
 *
 * If there is a request error or the response code is not 200
 * an error will be passed to the callback.
 *
 * For a successful request the parsed JSON will be passed to the callback.
 *
 * @param  {Error}      error    Request error.
 * @param  {Response}   response Response object.
 * @param  {String}     body     Response body.
 * @param  {Function} callback   Callback for when the request is complete.
 * @returns {Object|Promise}
 */
PushBullet.prototype.handleResponse = function handleResponse(response, callback) {
	if (response.statusCode !== 200) {
		return this.handleError(null, response, callback);
	}

	var reply = response.body;
	if (this.options.fullResponses) {
		reply = response;
	}

	if (typeof callback === 'function') {
		callback(null, reply);
	}

	return reply;
};

/**
 * Handle errors or error responses.
 *
 * @param  {Error}      error    Request error.
 * @param  {Response}   response Response object.
 * @param  {String}     body     Response body.
 * @param  {Function} callback   Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.handleError = function handleError(error, response, callback) {
	return new Promise((resolve, reject) => {
		if (error) {
			if (typeof callback === 'function') {
				return callback(error);
			}
			return reject(error);
		}

		if (response.statusCode !== 200) {
			var err = response.body.error && response.body.error.message ? new Error(response.body.error.message) : new Error(http.STATUS_CODES[response.statusCode]);

			if (typeof callback === 'function') {
				return callback(err);
			}

			return reject(err);
		}

		if (typeof callback === 'function') {
			callback();
		}

		resolve();
	});
};

require('./internal/chats');
require('./internal/devices');
require('./internal/ephemerals');
require('./internal/pushes');
require('./internal/subscriptions');
require('./internal/users');
