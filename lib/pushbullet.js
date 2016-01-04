/*global module,require*/

var fs       = require('fs');
var http     = require('http');
var mime     = require('mime');
var path     = require('path');
var request  = require('request');

var Stream   = require('./stream.js');

// API routes
var API_BASE           = 'https://api.pushbullet.com/v2';
var DEVICES_END_POINT  = API_BASE + '/devices';
var PUSH_END_POINT     = API_BASE + '/pushes';
var UPLOAD_END_POINT   = API_BASE + '/upload-request';
var USERS_END_POINT    = API_BASE + '/users';
var SUBS_END_POINT     = API_BASE + '/subscriptions';
var CHANNELS_END_POINT = API_BASE + '/channel-info';

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
		headers: {
			'Access-Token': apiKey
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
 * @param  {String}   deviceParams Push device parameters. See push().
 * @param  {String}   title        Title of note.
 * @param  {String}   body         Body of note.
 * @param  {Function} callback     Callback for when request is complete.
 */
PushBullet.prototype.note = function note(deviceParams, title, body, callback) {
	this.push(deviceParams, {
		type: 'note',
		title: title,
		body: body
	}, callback);
};

/**
 * Push a link to a device.
 *
 * @param  {String}   deviceParams Push device parameters. See push().
 * @param  {String}   title        Name of address.
 * @param  {String}   url          URL to push.
 * @param  {Function} callback     Callback for when the request is complete.
 */
PushBullet.prototype.link = function link(deviceParams, title, url, callback) {
	this.push(deviceParams, {
		type: 'link',
		title: title,
		url: url
	}, callback);
};

/**
 * Push a file to a device.
 *
 * @param  {String}   deviceParams Push device parameters. See push().
 * @param  {String}   filePath     Path to file.
 * @param  {String}   message      Optional message to send with file.
 * @param  {Function} callback     Callback for when the request is complete.
 */
PushBullet.prototype.file = function file(deviceParams, filePath, message, callback) {
	var self = this;

	if ( ! callback) {
		callback = message;
		message = null;
	}

	fs.stat(filePath, function(error, stats) {
		if (error) {
			if (typeof callback === 'function') {
				callback(error);
				return;
			}
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
			if (error || response.statusCode !== 200) {
				self.handleError(error, response, body, callback);
				return;
			}

			// Not posting to the API so not using `this.request`
			var req = request.post(body.upload_url, function(error, response) {
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
					type: 'file',
					file_name: fileName,
					file_type: fileType,
					file_url: body.file_url
				};

				if (message) {
					parameters.body = message;
				}

				self.push(deviceParams, parameters, callback);
			});

			var form = req.form();
			Object.keys(body.data).forEach(function(key) {
				form.append(key, body.data[key]);
			});
			var stream = fs.createReadStream(filePath);
			form.append('file', stream);

		});
	});

};

/**
 * Push 'something' to a device.
 *
 * @param  {Mixed}    deviceParams Device parameters.
 * @param  {Object}   bullet       Request parameters as described on https://www.pushbullet.com/api
 * @param  {Function} callback     Callback for when the request is complete.
 */
PushBullet.prototype.push = function push(deviceParams, bullet, callback) {
	var self = this;

	// If deviceParams is a string it could be a contact email or device iden.
	if (typeof deviceParams === 'string') {
		if (deviceParams.indexOf('@') !== -1) {
			bullet.email = deviceParams;
		}
		else {
			bullet.device_iden = deviceParams;
		}
	}
	// If it's a number it's an old style device id.
	else if (typeof deviceParams === 'number') {
		bullet.device_id = deviceParams;
	}
	// If it's an object assume it defines a property of
	// - device_id
	// - device_iden
	// - email
	// - channel_tag
	// - client_iden
	// and optionally source_device_iden
	else if (typeof deviceParams === 'object') {
		for (var param in deviceParams) {
			bullet[param] = deviceParams[param];
		}
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
 * - `active` is used to only select undeleted pushes.
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
		options = {
			active: true,
			modified_after: 0
		};
	}

	if (options.active === undefined) {
		options.active = true;
	}

	if (options.modified_after === undefined) {
		options.modified_after = 0;
	}

	self.getList(PUSH_END_POINT, options, callback);
};

/**
 * Dismiss a push.
 *
 * @param  {String}   pushIden Push IDEN of the push to update.
 * @param  {Object}   updates  Updates to make to push.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.dismissPush = function dismissPush(pushIden, callback) {
	this.updatePush(pushIden, { dismissed: true }, callback);
};

/**
 * Update a push.
 *
 * @param  {String}   pushIden Push IDEN of the push to update.
 * @param  {Object}   updates  Updates to make to push.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.updatePush = function updatePush(pushIden, updates, callback) {
	var self = this;

	if ( ! callback) {
		callback = updates;
	}

	var options = {
		json: updates
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
 * Delete all pushes belonging to the current user.
 *
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.deleteAllPushes = function deleteAllPushes(callback) {
	var self = this;

	self.request.del(PUSH_END_POINT, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Get a list of devices which can be pushed to.
 *
 * The `options` parameter can use two attributes `cursor` and `limit`
 * to control the data returned.
 *
 * - `active` is used to restrict the results to only active devices.
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
		options = {
			active: true
		};
	}

	if (options.active === undefined) {
		options.active = true;
	}

	self.getList(DEVICES_END_POINT, options, callback);
};

/**
 * Create a new device.
 *
 * @param  {Object}   deviceOptions Object of device options.
 * @param  {Function} callback      Called when the request is complete.
 */
PushBullet.prototype.createDevice = function createDevice(deviceOptions, callback) {
	var self = this;

	var options = {
		json: deviceOptions
	};

	self.request.post(DEVICES_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Update new device.
 *
 * @param  {Object}   deviceOptions Object of device options.
 * @param  {Function} callback      Called when the request is complete.
 */
PushBullet.prototype.updateDevice = function updateDevice(deviceIden, deviceOptions, callback) {
	var self = this;

	var options = {
		json: deviceOptions
	};

	self.request.post(DEVICES_END_POINT + '/' + deviceIden, options, function(error, response, body) {
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
 * Get a list of current subscriptions.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.subscriptions = function subscriptions(options, callback) {
	var self = this;

	if ( ! callback) {
		callback = options;
		options = {
			active: true
		};
	}

	if (options.active === undefined) {
		options.active = true;
	}

	self.getList(SUBS_END_POINT, options, callback);
};

/**
 * Subscribe to a channel.
 *
 * @param {String}   channelTag The tag of the channel to subscribe to.
 * @param {Function} callback   Called when the request is complete.
 */
PushBullet.prototype.subscribe = function subscribe(channelTag, callback) {
	var self = this;

	var options = {
		json: {
			channel_tag: channelTag
		}
	};

	self.request.post(SUBS_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Unsubscribe from a channel.
 *
 * @param {String}   subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.unsubscribe = function unsubscribe(subscriptionIden, callback) {
	var self = this;

	self.request.post(SUBS_END_POINT + '/' + subscriptionIden, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Mute a subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to mute.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.muteSubscription = function muteSubscription(subscriptionIden, callback) {
	this.updateSubscription(subscriptionIden, { muted: true }, callback);
};

/**
 * Unmute subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to unmute.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.unmuteSubscription = function unmuteSubscription(subscriptionIden, callback) {
	this.updateSubscription(subscriptionIden, { muted: false }, callback);
};

/**
 * Update a subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param {Object}   updates          Updates to make to subscription.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.updateSubscription = function updateSubscription(subscriptionIden, updates, callback) {
	var self = this;

	if ( ! callback) {
		callback = updates;
	}

	var options = {
		json: updates
	};

	self.request.post(SUBS_END_POINT + '/' + subscriptionIden, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Get information about a channel.
 *
 * @param {String}   channelTag The tag of the channel to get information about.
 * @param {Function} callback   Called when the request is complete.
 */
PushBullet.prototype.channelInfo = function channelInfo(channelTag, callback) {
	var self = this;

	var options = {
		qs: {
			tag: channelTag
		}
	};

	self.request.get(CHANNELS_END_POINT, options, function(error, response, body) {
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
	if (error || response.statusCode !== 200) {
		this.handleError(error, response, body, callback);
		return;
	}

	if (typeof callback === 'function') {
		callback(null, body);
	}
};

PushBullet.prototype.handleError = function handleError(error, response, body, callback) {
	if (error) {
		if (typeof callback === 'function') {
			callback(error);
		}
		return;
	}

	if (response.statusCode !== 200) {
		if (typeof callback === 'function') {
			if (body.error && body.error.message) {
				callback(new Error(body.error.message));
			}
			else {
				callback(new Error(http.STATUS_CODES[response.statusCode]));
			}
		}
		return;
	}

	if (typeof callback === 'function') {
		callback();
	}
};
