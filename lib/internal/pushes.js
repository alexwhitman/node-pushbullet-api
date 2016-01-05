var fs      = require('fs');
var http    = require('http');
var mime    = require('mime');
var path    = require('path');
var request = require('request');

var PushBullet = require('../pushbullet');

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

		self.request.get(PushBullet.UPLOAD_END_POINT, authOptions, function(error, response, body) {
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

	var req = self.request.post(PushBullet.PUSH_END_POINT, { json: bullet }, function(error, response, body) {
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

	self.getList(PushBullet.PUSH_END_POINT, options, callback);
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

	self.request.post(PushBullet.PUSH_END_POINT + '/' + pushIden, options, function(error, response, body) {
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

	self.request.del(PushBullet.PUSH_END_POINT + '/' + pushIden, function(error, response, body) {
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

	self.request.del(PushBullet.PUSH_END_POINT, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};
