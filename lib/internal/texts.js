import PushBullet from '../pushbullet.js';

/**
 * Create a new text.
 *
 * See https://docs.pushbullet.com/#text for additional options that can be set.
 *
 * @param   {String}  deviceIden Device IDEN of the device which can send SMS messages.
 * @param   {Array}   addresses String or array of strings of recipient phone numbers.
 * @param   {String}  message Message text to be sent.
 * @param   {Object}  textOptions Additional text options.
 * @returns {Promise}
 */
PushBullet.prototype.createText = async function createText(deviceIden, addresses, message, textOptions) {
	const options = {
		data : {
			target_device_iden : deviceIden,
			addresses          : Array.isArray(addresses) ? addresses : [ addresses ],
			message            : message
		}
	};

	if (textOptions.guid) {
		options.data.guid = textOptions.guid;
	}
	if (textOptions.status) {
		options.data.status = textOptions.status;
	}
	if (textOptions.file_type) {
		options.data.file_type = textOptions.file_type;
	}
	if (textOptions.file_url) {
		options.file_url = textOptions.file_url;
	}
	if (textOptions.skip_file_delete) {
		options.skip_file_delete = textOptions.skip_file_delete;
	}

	return this.makeRequest('post', PushBullet.TEXTS_END_POINT, { json : options });
};

/**
 * Update text.
 *
 * See https://docs.pushbullet.com/#text for valid attributes.
 *
 * @param   {String}  textIden The iden of the text to update.
 * @param   {Object}  textOptions Text attributes to apply updates to.
 * @returns {Promise}
 */
PushBullet.prototype.updateText = async function updateText(textIden, textOptions) {
	return this.makeRequest('post', PushBullet.TEXTS_END_POINT + '/' + textIden, { json : textOptions });
};

/**
 * Delete a text.
 *
 * @param   {String}  textIden The iden of the text to update.
 * @returns {Promise}
 */
PushBullet.prototype.deleteText = async function deleteText(textIden) {
	return this.makeRequest('delete', PushBullet.TEXTS_END_POINT + '/' + textIden, {});
};
