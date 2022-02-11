import PushBullet from '../pushbullet.js';

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
 * @param   {Object}  options Optional options object.
 * @returns {Promise}
 */
PushBullet.prototype.devices = async function devices(options) {
	options = options ? options : {};

	if (options.active === undefined) {
		options.active = true;
	}

	return this.getList(PushBullet.DEVICES_END_POINT, options);
};

/**
 * Create a new device.
 *
 * @param   {Object}  deviceOptions Object of device options.
 * @returns {Promise}
 */
PushBullet.prototype.createDevice = async function createDevice(deviceOptions) {
	const options = {
		json : deviceOptions
	};

	return this.makeRequest('post', PushBullet.DEVICES_END_POINT, options);
};

/**
 * Update a device.
 *
 * @param   {String}  deviceIden The iden of the device to update.
 * @param   {Object}  deviceOptions Object of device options.
 * @returns {Promise}
 */
PushBullet.prototype.updateDevice = async function updateDevice(deviceIden, deviceOptions) {
	const options = {
		json : deviceOptions
	};

	return this.makeRequest('post', PushBullet.DEVICES_END_POINT + '/' + deviceIden, options);
};

/**
 * Delete a device.
 *
 * @param   {String}  deviceIden Device IDEN of the device to delete.
 * @returns {Promise}
 */
PushBullet.prototype.deleteDevice = async function deleteDevice(deviceIden) {
	return this.makeRequest('delete', PushBullet.DEVICES_END_POINT + '/' + deviceIden, {});
};
