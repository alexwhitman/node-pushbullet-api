var PushBullet = require('../pushbullet');

/**
 * Get information for the current user.
 *
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.me = function me(callback) {
	return this.makeRequest('get', PushBullet.USERS_END_POINT + '/me', null, callback);
};
