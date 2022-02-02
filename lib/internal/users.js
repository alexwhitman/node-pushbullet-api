import PushBullet from '../pushbullet.js';

/**
 * Get information for the current user.
 *
 * @returns {Promise}
 */
PushBullet.prototype.me = async function me() {
	return this.makeRequest('get', PushBullet.USERS_END_POINT + '/me', null);
};
