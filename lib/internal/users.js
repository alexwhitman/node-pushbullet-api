var PushBullet = require('../pushbullet');

/**
 * Get information for the current user.
 *
 * @param  {Function} callback Callback for when the request is complete.
 */
PushBullet.prototype.me = function me(callback) {
	var self = this;

	self.request.get(PushBullet.USERS_END_POINT + '/me', function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};
