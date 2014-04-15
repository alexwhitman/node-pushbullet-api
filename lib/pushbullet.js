/*global module,require*/

var fs      = require('fs');
var request = require('request');

// API routes
var API_BASE          = 'https://api.pushbullet.com/v2';
var DEVICES_END_POINT = API_BASE + '/devices';
var PUSH_END_POINT    = API_BASE + '/pushes';

/**
 * PushBullet API abstraction module.
 *
 * @param {String} apiKey PushBullet API key.
 */
function PushBullet(apiKey) {
	if ( ! apiKey) {
		throw new Error('API Key is required');
	}

	request = request.defaults({
		auth: {
			username: apiKey,
			password: ''
		}
	});
}

module.exports = PushBullet;

/**
 * Push a note to a device.
 *
 * @param  {String}   deviceIden Device IDEN of device to push to.
 * @param  {String}   title      Title of note.
 * @param  {String}   body       Body of note.
 * @param  {Function} callback   Callback for when request is complete.
 */
PushBullet.prototype.note = function note(deviceIden, title, body, callback) {
	this.push({
		device_iden: deviceIden,
		type: 'note',
		title: title,
		body: body
	}, callback);
};

/**
 * Push an address to a device.
 *
 * @param  {String}   deviceIden Device IDEN of device to push to.
 * @param  {String}   name       Name of address.
 * @param  {String}   body       Address text or Google Maps URL.
 * @param  {Function} callback   Callback for when the request is complete.
 */
PushBullet.prototype.address = function address(deviceIden, name, body, callback) {
	this.push({
		device_iden: deviceIden,
		type: 'address',
		name: name,
		address: body
	}, callback);
};

/**
 * Push a list to a device.
 *
 * @param  {String}   deviceIden Device IDEN of device to push to.
 * @param  {String}   title      Name of address.
 * @param  {Array}    items      Array of list items.
 * @param  {Function} callback   Callback for when the request is complete.
 */
PushBullet.prototype.list = function list(deviceIden, title, items, callback) {
	if (typeof items === 'string') {
		items = [ items ];
	}

	this.push({
		device_iden: deviceIden,
		type: 'list',
		title: title,
		items: items
	}, callback);
};

/**
 * Push a link to a device.
 *
 * @param  {String}   deviceIden Device IDEN of device to push to.
 * @param  {String}   title      Name of address.
 * @param  {String}   url        URL to push.
 * @param  {Function} callback   Callback for when the request is complete.
 */
PushBullet.prototype.link = function link(deviceIden, title, url, callback) {
	this.push({
		device_iden: deviceIden,
		type: 'link',
		title: title,
		url: url
	}, callback);
};

/**
 * Push a file to a device.
 *
 * @param  {String}   deviceIden Device IDEN of device to push to.
 * @param  {String}   filePath   Path to file.
 * @param  {Function} callback   Callback for when the request is complete.
 */
PushBullet.prototype.file = function file(deviceIden, filePath, callback) {
	this.push({
		device_iden: deviceIden,
		type: 'file',
		file: filePath
	}, callback);
};

/**
 * Push 'something' to a device.
 *
 * @param  {Object}   bullet   Request parameters as described on https://www.pushbullet.com/api
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.push = function push(bullet, callback) {
	var self = this;

	var payload = {};

	// If the bullet.device_iden is a number, switch to device_id
	var idKey = 'device_iden';
	if (typeof bullet.device_iden === 'number') {
		bullet.device_id = bullet.device_iden;
		delete bullet.device_iden;
		idKey = 'device_id';
	}

	if (bullet.type !== 'file') {
		payload.json = bullet;
	}

	var req = request.post(PUSH_END_POINT, payload, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});

	if (bullet.type === 'file') {
		var form = req.form();
		form.append(idKey, bullet[idKey]);
		form.append('type', bullet.type);
		form.append('file', fs.createReadStream(bullet.file));
	}
};

/**
 * Get a list of devices which can be pushed to.
 *
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.devices = function devices(callback) {
	var self = this;

	request.get(DEVICES_END_POINT, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
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
 */
PushBullet.prototype.handleResponse = function handleResponse(error, response, body, callback) {
	if (error) {
		if (typeof callback === 'function') {
			callback(error);
		}
		return;
	}

	if (response.statusCode !== 200) {
		if (typeof callback === 'function') {
			callback(new Error(body));
		}
		return;
	}

	var json = typeof body === 'string' ? JSON.parse(body) : body;

	if (typeof callback === 'function') {
		callback(null, json);
	}
};
