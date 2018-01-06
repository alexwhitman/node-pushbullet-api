var PushBullet = require('../pushbullet');

/**
 * Get a list of current subscriptions.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.subscriptions = function subscriptions(options, callback) {
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

	return this.getList(PushBullet.SUBS_END_POINT, options, callback);
};

/**
 * Subscribe to a channel.
 *
 * @param {String}   channelTag The tag of the channel to subscribe to.
 * @param {Function} callback   Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.subscribe = function subscribe(channelTag, callback) {
	var options = {
		json: {
			channel_tag: channelTag
		}
	};

	return this.makeRequest('post', PushBullet.SUBS_END_POINT, options, callback);
};

/**
 * Unsubscribe from a channel.
 *
 * @param {String}   subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param {Function} callback         Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.unsubscribe = function unsubscribe(subscriptionIden, callback) {
	return this.makeRequest('delete', PushBullet.SUBS_END_POINT + '/' + subscriptionIden, null, callback);
};

/**
 * Mute a subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to mute.
 * @param {Function} callback         Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.muteSubscription = function muteSubscription(subscriptionIden, callback) {
	return this.updateSubscription(subscriptionIden, { muted: true }, callback);
};

/**
 * Unmute subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to unmute.
 * @param {Function} callback         Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.unmuteSubscription = function unmuteSubscription(subscriptionIden, callback) {
	return this.updateSubscription(subscriptionIden, { muted: false }, callback);
};

/**
 * Update a subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param {Object}   updates          Updates to make to subscription.
 * @param {Function} callback         Called when the request is complete.
 * @returns {Promise}
 */
PushBullet.prototype.updateSubscription = function updateSubscription(subscriptionIden, updates, callback) {
	if (!callback && typeof updates === 'function') {
		callback = updates;
	}

	var options = {
		json: updates
	};

	return this.makeRequest('post', PushBullet.SUBS_END_POINT + '/' + subscriptionIden, options, callback);
};

/**
 * Get information about a channel.
 *
 * @param {String}   channelTag The tag of the channel to get information about.
 * @param {Function} callback   Called when the request is complete.
 */
PushBullet.prototype.channelInfo = function channelInfo(channelTag, callback) {
	var options = {
		qs: {
			tag: channelTag
		}
	};

	return this.makeRequest('get', PushBullet.CHANNELS_END_POINT, options, callback);
};
