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
 */
PushBullet.prototype.sendSMS = function sendSMS(smsOptions, callback) {
	var options = clone(smsOptions);

	options.package_name = 'com.pushbullet.android';
	options.type = 'messaging_extension_reply';

	this.sendEphemeral(options, callback);
};

/**
 * Send clipboard content.
 *
 * The options require body, source_user_iden and source_device_iden.
 * See https://docs.pushbullet.com/#universal-copypaste for details.
 *
 * @param  {Object}   clipOptions Clipboard options.
 * @param  {Function} callback    Callback for when the request is complete.
 */
PushBullet.prototype.sendClipboard = function sendClipboard(clipOptions, callback) {
	var options = clone(clipOptions);

	options.type = 'clip';

	this.sendEphemeral(options, callback);
};

/**
 * Dismiss an ephemeral.
 *
 * The options require package_name, notification_id, notification_tag and source_user_iden.
 * See https://docs.pushbullet.com/#dismissal-ephemeral for details.
 *
 * @param  {Object}   ephemerealOptions Ephemeral dismissal options.
 * @param  {Function} callback          Callback for when the request is complete.
 */
PushBullet.prototype.dismissEphemeral = function dismissEphemeral(ephemerealOptions, callback) {
	var options = clone(ephemerealOptions);

	options.type = 'dismissal';

	this.sendEphemeral(options, callback);
};

/**
 * Send an ephemeral.
 *
 * @param  {Object}   ephemerealOptions Ephemeral options.
 * @param  {Function} callback          Callback for when the request is complete.
 */
PushBullet.prototype.sendEphemeral = function sendEphemeral(ephemerealOptions, callback) {
	var self = this;

	var options = {
		json: {
			type: 'push',
			push: ephemerealOptions
		}
	};

	self.request.post(PushBullet.EPHEMERALS_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};
