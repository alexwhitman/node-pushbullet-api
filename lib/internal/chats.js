var PushBullet = require('../pushbullet');

/**
 * Get a list of current chats.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.chats = function chats(options, callback) {
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

	return this.getList(PushBullet.CHATS_END_POINT, options, callback);
};

/**
 * Create a new chat.
 *
 * @param {String}   channelTag Email of the person to create the chat with.
 * @param {Function} callback   Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.createChat = function createChat(email, callback) {
	var options = {
		json: {
			email: email
		}
	};

	return this.makeRequest('post', PushBullet.CHATS_END_POINT, options, callback);
};

/**
 * Mute a chat.
 *
 * @param {String}   chatIden The iden of the chat to mute.
 * @param {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.muteChat = function muteChat(chatIden, callback) {
	return this.updateChat(chatIden, { muted: true }, callback);
};

/**
 * Unmute chat.
 *
 * @param {String}   chatIden The iden of the chat to unmute.
 * @param {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.unmuteChat = function unmuteChat(chatIden, callback) {
	return this.updateChat(chatIden, { muted: false }, callback);
};

/**
 * Update a chat.
 *
 * @param {String}   chatIden The iden of the chat to ubsubscribe from.
 * @param {Object}   updates  Updates to make to chat.
 * @param {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.updateChat = function updateChat(chatIden, updates, callback) {
	if (!callback) {
		callback = updates;
	}

	var options = {
		json: updates
	};

	return this.makeRequest('post', PushBullet.CHATS_END_POINT + '/' + chatIden, options, callback);
};

/**
 * Delete a chat.
 *
 * @param {String}   chatIden The iden of the chat to delete.
 * @param {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.deleteChat = function deleteChat(chatIden, callback) {
	return this.makeRequest('delete', PushBullet.CHATS_END_POINT + '/' + chatIden, null, callback);
};
