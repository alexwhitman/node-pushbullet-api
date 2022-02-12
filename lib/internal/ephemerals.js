import clone      from 'clone';
import PushBullet from '../pushbullet.js';
import util       from 'util';

/**
 * Send an SMS.
 *
 * The options require source_user_iden, target_device_iden, conversation_iden and message.
 * See https://docs.pushbullet.com/#send-sms for details.
 *
 * @param   {Object}  smsOptions SMS options.
 * @returns {Promise}
 */
PushBullet.prototype.sendSMS = util.deprecate(async function sendSMS(smsOptions) {
	const options = clone(smsOptions);

	options.package_name = 'com.pushbullet.android';
	options.type = 'messaging_extension_reply';

	return this.sendEphemeral(options);
}, 'sendSMS() is deprecated, use createText() instead.');

/**
 * Send clipboard content.
 *
 * The options require body, source_user_iden and source_device_iden.
 * See https://docs.pushbullet.com/#universal-copypaste for details.
 *
 * @param   {Object}  clipOptions Clipboard options.
 * @returns {Promise}
 */
PushBullet.prototype.sendClipboard = async function sendClipboard(clipOptions) {
	const options = clone(clipOptions);

	options.type = 'clip';

	return this.sendEphemeral(options);
};

/**
 * Dismiss an ephemeral.
 *
 * The options require package_name, notification_id, notification_tag and source_user_iden.
 * See https://docs.pushbullet.com/#dismissal-ephemeral for details.
 *
 * @param   {Object}  ephemeralOptions Ephemeral dismissal options.
 * @returns {Promise}
 */
PushBullet.prototype.dismissEphemeral = async function dismissEphemeral(ephemeralOptions) {
	const options = clone(ephemeralOptions);

	options.type = 'dismissal';

	return this.sendEphemeral(options);
};

/**
 * Send an ephemeral.
 *
 * @param   {Object}  ephemeralOptions  Ephemeral options.
 * @returns {Promise}
 */
PushBullet.prototype.sendEphemeral = async function sendEphemeral(ephemeralOptions) {
	if (this.encryption) {
		const encryptedOptions = this.encryption.encrypt(JSON.stringify(ephemeralOptions));
		ephemeralOptions = {
			ciphertext : encryptedOptions,
			encrypted  : true
		};
	}

	const options = {
		json : {
			type : 'push',
			push : ephemeralOptions
		}
	};

	return this.makeRequest('post', PushBullet.EPHEMERALS_END_POINT, options);
};
