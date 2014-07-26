/*global module,require*/

var FormData = require('form-data');
var fs       = require('fs');
var http     = require('http');
var mime     = require('mime');
var path     = require('path');
var request  = require('request');

var Stream   = require('./stream.js');

// API routes
var API_BASE           = 'https://api.pushbullet.com/v2';
var CONTACTS_END_POINT = API_BASE + '/contacts';
var DEVICES_END_POINT  = API_BASE + '/devices';
var PUSH_END_POINT     = API_BASE + '/pushes';
var UPLOAD_END_POINT   = API_BASE + '/upload-request';
var USERS_END_POINT    = API_BASE + '/users';

/**
 * PushBullet API abstraction module.
 *
 * @param {String} apiKey PushBullet API key.
 */
function PushBullet(apiKey) {
	if ( ! apiKey) {
		throw new Error('API Key is required');
	}

	this.apiKey = apiKey;

	this.request = request.defaults({
		auth: {
			username: apiKey,
			password: ''
		},
		json: true
	});
}

module.exports = PushBullet;

/**
 * Get information for the current user.
 *
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.me = function me(callback) {
	var self = this;

	self.request.get(USERS_END_POINT + '/me', function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

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
 * @param  {String}   message    Optional message to send with file.
 * @param  {Function} callback   Callback for when the request is complete.
 */
PushBullet.prototype.file = function file(deviceIden, filePath, message, callback) {
	var self = this;

	if ( ! callback) {
		callback = message;
		message = null;
	}

	var fileName = path.basename(filePath);
	var fileType = mime.lookup(filePath);

	var authOptions = {
		qs: {
			file_name: fileName,
			file_type: fileType
		}
	};

	self.request.get(UPLOAD_END_POINT, authOptions, function(error, response, body) {
		if (error) {
			if (typeof callback === 'function') {
				callback(error);
			}
			return;
		}

		var form = new FormData();
		Object.keys(body.data).forEach(function(key) {
			form.append(key, body.data[key]);
		});
		form.append('file', fs.createReadStream(filePath));

		// Content-Length isn't sent by request for streaming forms so this is a workaround.
		// See https://github.com/mikeal/request/issues/316#issuecomment-10800882
		form.getLength(function(error, length) {
			// Not posting to the API so not using `this.request`
			var req = request.post(body.upload_url, { headers: { 'content-length' : length } }, function(error, response) {
				if (error || response.statusCode !== 204) {
					if (typeof callback === 'function') {
						if ( ! error) {
							error = new Error(http.STATUS_CODES[response.statusCode]);
						}
						callback(error);
					}
					return;
				}

				var parameters = {
					device_iden: deviceIden,
					type: 'file',
					file_name: fileName,
					file_type: fileType,
					file_url: body.file_url
				};

				if (message) {
					parameters.body = message;
				}

				self.push(parameters, callback);
			});
			req._form = form;
		});
	});
};

/**
 * Push 'something' to a device.
 *
 * @param  {Object}   bullet   Request parameters as described on https://www.pushbullet.com/api
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.push = function push(bullet, callback) {
	var self = this;

	// If the bullet.device_iden is a number, switch to device_id
	if (typeof bullet.device_iden === 'number') {
		bullet.device_id = bullet.device_iden;
		delete bullet.device_iden;
	}
	else if (bullet.device_iden.indexOf('@') !== -1) {
		bullet.email = bullet.device_iden;
		delete bullet.device_iden;
	}

	var req = self.request.post(PUSH_END_POINT, { json: bullet }, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Performs a GET request to an end point.
 *
 * Options passed are added to the end point as a query string.
 *
 * @param  {String}   endPoint URL to send GET request to.
 * @param  {Object}   options  Key/value options used as query string parameters.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.getList = function getList(endPoint, options, callback) {
	var self = this;

	if ( ! callback) {
		callback = options;
		options = {};
	}

	var parameters = {};

	var optionKeys = Object.keys(options);
	if (optionKeys.length > 0) {

		parameters.qs = {};

		optionKeys.forEach(function(key) {
			parameters.qs[key] = options[key];
		});
	}

	self.request.get(endPoint, parameters, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Get the push history.
 *
 * The `options` parameter can use three attributes `cursor`, `limit`
 * and `modified_after` to control the data returned.
 *
 * - `cursor` is used to select the page if the results have been paginated.
 * - `limit` is used to limit the number of objects in the reponse.
 * - `modified_after` should be a timestamp.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.history = function history(options, callback) {
	var self = this;

	if ( ! callback) {
		callback = options;
		options = { modified_after: 0 };
	}

	if (options.modified_after === 'undefined') {
		options.modified_after = 0;
	}

	self.getList(PUSH_END_POINT, options, callback);
};

/**
 * Update a push.
 *
 * Currently only marks a push as dismissed.
 *
 * @param  {String}   pushIden Push IDEN of the push to update.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.updatePush = function updatePush(pushIden, callback) {
	var self = this;

	var options = {
		form: {
			dismissed: 'true'
		}
	};

	self.request.post(PUSH_END_POINT + '/' + pushIden, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Delete a push.
 *
 * @param  {String}   pushIden Push IDEN of the push to delete.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.deletePush = function deletePush(pushIden, callback) {
	var self = this;

	self.request.del(PUSH_END_POINT + '/' + pushIden, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Get a list of devices which can be pushed to.
 *
 * The `options` parameter can use two attributes `cursor` and `limit`
 * to control the data returned.
 *
 * - `cursor` is used to select the page if the results have been paginated.
 * - `limit` is used to limit the number of objects in the reponse.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.devices = function devices(options, callback) {
	var self = this;

	if ( ! callback) {
		callback = options;
		options = {};
	}

	self.getList(DEVICES_END_POINT, options, callback);
};

/**
 * Create a new device.
 *
 * @param  String     nickname Name of the new device.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.createDevice = function createDevice(nickname, callback) {
	var self = this;

	var options = {
		form: {
			nickname: nickname,
			type: 'stream'
		}
	};

	self.request.post(DEVICES_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Delete a device.
 *
 * @param  {String}   deviceIden Device IDEN of the device to delete.
 * @param  {Function} callback   Called when the request is complete.
 */
PushBullet.prototype.deleteDevice = function deleteDevice(deviceIden, callback) {
	var self = this;

	self.request.del(DEVICES_END_POINT + '/' + deviceIden, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Get a list of contacts which can be pushed to.
 *
 * The `options` parameter can use two attributes `cursor` and `limit`
 * to control the data returned.
 *
 * - `cursor` is used to select the page if the results have been paginated.
 * - `limit` is used to limit the number of objects in the reponse.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.contacts = function contacts(callback) {
	var self = this;

	if ( ! callback) {
		callback = options;
		options = {};
	}

	self.getList(CONTACTS_END_POINT, options, callback);
};

/**
 * Create a contact.
 *
 * @param  {String}   name     Contact name.
 * @param  {String}   email    Contact email.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.createContact = function createContact(name, email, callback) {
	var self = this;

	var options = {
		form: {
			name: name,
			email: email
		}
	};

	self.request.post(CONTACTS_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Delete a contact.
 *
 * @param  {String}   contactIden Contact IDEN of the contact to delete.
 * @param  {Function} callback    Called when the request is complete.
 */
PushBullet.prototype.deleteContact = function deleteContact(contactIden, callback) {
	var self = this;

	self.request.del(CONTACTS_END_POINT + '/' + contactIden, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Return a new stream listener.
 *
 * @return {Stream} Stream listener.
 */
PushBullet.prototype.stream = function stream() {
	return new Stream(this.apiKey);
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

	if (typeof callback === 'function') {
		callback(null, body);
	}
};
