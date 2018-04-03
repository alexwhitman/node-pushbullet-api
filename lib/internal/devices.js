var PushBullet = require('../pushbullet');

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
 * @returns {Promise}
 */
PushBullet.prototype.devices = function devices(options, callback) {
	if (!callback && typeof options === 'function') {
		callback = options;
		options = {
			active: true
		};
	}

	options = options ? options : {};

	if (options.active === undefined) {
		options.active = true;
	}

	return this.getList(PushBullet.DEVICES_END_POINT, options, callback);
};

/**
 * Create a new device.
 *
 * @param  {Object}   deviceOptions Object of device options.
 * @param  {Function} callback      Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.createDevice = function createDevice(deviceOptions, callback) {
	var options = {
		json: deviceOptions
	};

	return this.makeRequest('post', PushBullet.DEVICES_END_POINT, options, callback);
};

/**
 * Update new device.
 *
 * @param  {Object}   deviceOptions Object of device options.
 * @param  {Function} callback      Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.updateDevice = function updateDevice(deviceIden, deviceOptions, callback) {
	var options = {
		json: deviceOptions
	};

	return this.makeRequest('post', PushBullet.DEVICES_END_POINT + '/' + deviceIden, options, callback);
};

/**
 * Delete a device.
 *
 * @param  {String}   deviceIden Device IDEN of the device to delete.
 * @param  {Function} callback   Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.deleteDevice = function deleteDevice(deviceIden, callback) {
	return this.makeRequest('delete', PushBullet.DEVICES_END_POINT + '/' + deviceIden, {}, callback);
};
