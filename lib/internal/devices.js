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

	self.getList(PushBullet.DEVICES_END_POINT, options, callback);
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

	self.request.post(PushBullet.DEVICES_END_POINT, options, function(error, response, body) {
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

	self.request.post(PushBullet.DEVICES_END_POINT + '/' + deviceIden, options, function(error, response, body) {
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

	self.request.del(PushBullet.DEVICES_END_POINT + '/' + deviceIden, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};
