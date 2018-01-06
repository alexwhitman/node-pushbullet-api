var clone = require('clone');

var PushBullet = require('../pushbullet');

/**
 * Send an SMS.
 *
 * The options require source_user_iden, target_device_iden, conversation_iden and message.
 * See https://docs.pushbullet.com/#send-sms for details.
 *
 * @param  {Object}   smsOptions SMS options.
 * @param  {Function} callback   Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.sendSMS = function sendSMS(smsOptions, callback) {
	var options = clone(smsOptions);

	options.package_name = 'com.pushbullet.android';
	options.type = 'messaging_extension_reply';

	return this.sendEphemeral(options, callback);
};

/**
 * Send clipboard content.
 *
 * The options require body, source_user_iden and source_device_iden.
 * See https://docs.pushbullet.com/#universal-copypaste for details.
 *
 * @param  {Object}   clipOptions Clipboard options.
 * @param  {Function} callback    Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.sendClipboard = function sendClipboard(clipOptions, callback) {
	var options = clone(clipOptions);

	options.type = 'clip';

	return this.sendEphemeral(options, callback);
};

/**
 * Dismiss an ephemeral.
 *
 * The options require package_name, notification_id, notification_tag and source_user_iden.
 * See https://docs.pushbullet.com/#dismissal-ephemeral for details.
 *
 * @param  {Object}   ephemeralOptions Ephemeral dismissal options.
 * @param  {Function} callback          Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.dismissEphemeral = function dismissEphemeral(ephemeralOptions, callback) {
	var options = clone(ephemeralOptions);

	options.type = 'dismissal';

	return this.sendEphemeral(options, callback);
};

/**
 * Send an ephemeral.
 *
 * @param  {Object}   ephemeralOptions  Ephemeral options.
 * @param  {Function} callback          Callback for when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.sendEphemeral = function sendEphemeral(ephemeralOptions, callback) {
	if (this.encryption) {
		var encryptedOptions = this.encryption.encrypt(JSON.stringify(ephemeralOptions));
		ephemeralOptions = {
			ciphertext: encryptedOptions,
			encrypted: true
		};
	}

	var options = {
		json: {
			type: 'push',
			push: ephemeralOptions
		}
	};

	return this.makeRequest('post', PushBullet.EPHEMERALS_END_POINT, options, callback);
};
