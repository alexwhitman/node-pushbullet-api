const fs      = require('fs');
const http    = require('http');
const mime    = require('mime');
const path    = require('path');
const request = require('request-promise-native');
const PushBullet = require('../pushbullet');

/**
 * Push a note to a device.
 *
 * @param  {String}   deviceParams Push device parameters. See push().
 * @param  {String}   title        Title of note.
 * @param  {String}   body         Body of note.
 * @param  {Function} callback     Callback for when request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.note = function note(deviceParams, title, body, callback) {
	const pushParameters = {
		type: 'note',
		title,
		body
	}

	if (typeof body === 'function') {
		callback = body;
		delete pushParameters.body
	}

	return this.push(deviceParams, pushParameters, callback);
};

/**
 * Push a link to a device.
 *
 * @param  {String}   deviceParams Push device parameters. See push().
 * @param  {String}   title        Name of address.
 * @param  {String}   url          URL to push.
 * @param  {String}   body    		 A message associated with the link.
 * @param  {Function} callback     Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.link = function link(deviceParams, title, url, body, callback) {
	if (!callback && typeof body === 'function') {
		callback = body;
		body = null;
	}

	return this.push(deviceParams, {
		type: 'link',
		title: title,
		url: url,
		body: body
	}, callback);
};

/**
 * Push a file to a device.
 *
 * @param  {String}   deviceParams Push device parameters. See push().
 * @param  {String}   filePath     Path to file.
 * @param  {String}   body	       A message to go with the file.
 * @param  {Function} callback     Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.file = function file(deviceParams, filePath, body, callback) {
	if (typeof body === 'function') {
		callback = body;
	}

	return new Promise((resolve, reject) => {
		fs.stat(filePath, (error, stats) => {
			if (error) {
				if (typeof callback === 'function') {
					callback(error);
				}

				return reject(error);
			}

			const fileName = path.basename(filePath);
			const fileType = mime.lookup(filePath);
			const reqData = {
				json: {
					file_name: fileName,
					file_type: fileType
				}
			};

			const parameters = {
				type: 'file',
				file_name: fileName,
				file_type: fileType,
				body
			};

			this.makeRequest('post', PushBullet.UPLOAD_END_POINT, reqData).then(response => {
				parameters.file_url = response.file_url;

				const uploadData = {
					url: response.upload_url,
					formData: {
						file: fs.createReadStream(filePath)
					},
					json: true,
					simple: false,
					resolveWithFullResponse: true
				};

				// Not posting to the API so not using `this.request`
				return request.post(uploadData);
			}).then(response => {
				if (response.statusCode !== 204) {
					const error = new Error(http.STATUS_CODES[response.statusCode]);

					if (typeof callback === 'function') {
						callback(error);
					}

					return reject(error);
				}

				resolve(this.push(deviceParams, parameters, callback));
			}).catch(err => {
				if (typeof callback === 'function') {
					callback(err);
				}

				reject(err);
			});
		});
	});
};

/**
 * Push 'something' to a device.
 *
 * @param  {Mixed}    deviceParams Device parameters.
 * @param  {Object}   bullet       Request parameters as described on https://docs.pushbullet.com/#create-push
 * @param  {Function} callback     Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.push = function push(deviceParams, bullet, callback) {
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

	return this.makeRequest('post', PushBullet.PUSH_END_POINT, { json: bullet }, callback)
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
 * @returns {Promise}
 */
PushBullet.prototype.history = function history(options, callback) {
	if (!callback && typeof options === 'function') {
		callback = options;
		options = {
			active: true,
			modified_after: 0
		};
	}

	options = options ? options : {};

	if (options.active === undefined) {
		options.active = true;
	}

	if (options.modified_after === undefined) {
		options.modified_after = 0;
	}

	return this.getList(PushBullet.PUSH_END_POINT, options, callback);
};

/**
 * Dismiss a push.
 *
 * @param  {String}   pushIden Push IDEN of the push to update.
 * @param  {Object}   updates  Updates to make to push.
 * @param  {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.dismissPush = function dismissPush(pushIden, callback) {
	return this.updatePush(pushIden, { dismissed: true }, callback);
};

/**
 * Update a push.
 *
 * @param  {String}   pushIden Push IDEN of the push to update.
 * @param  {Object}   updates  Updates to make to push.
 * @param  {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.updatePush = function updatePush(pushIden, updates, callback) {
	if (!callback && typeof updates === 'function') {
		callback = updates;
		updates = false;
	}

	updates = updates ? updates : {};

	var options = {
		json: updates
	};

	return this.makeRequest('post', PushBullet.PUSH_END_POINT + '/' + pushIden, options, callback);
};

/**
 * Delete a push.
 *
 * @param  {String}   pushIden Push IDEN of the push to delete.
 * @param  {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.deletePush = function deletePush(pushIden, callback) {
	return this.makeRequest('delete', PushBullet.PUSH_END_POINT + '/' + pushIden, null, callback);
};

/**
 * Delete all pushes belonging to the current user.
 *
 * @param  {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.deleteAllPushes = function deleteAllPushes(callback) {
	return this.makeRequest('delete', PushBullet.PUSH_END_POINT, {}, callback);
};
