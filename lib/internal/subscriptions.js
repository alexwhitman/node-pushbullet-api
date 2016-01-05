var PushBullet = require('../pushbullet');

/**
 * Get a list of current subscriptions.
 *
 * @param  {Object}   options  Optional options object.
 * @param  {Function} callback Called when the request is complete.
 */
PushBullet.prototype.subscriptions = function subscriptions(options, callback) {
	var self = this;

	if ( ! callback) {
		callback = options;
		options = {
			active: true
		};
	}

	if (options.active === undefined) {
		options.active = true;
	}

	self.getList(PushBullet.SUBS_END_POINT, options, callback);
};

/**
 * Subscribe to a channel.
 *
 * @param {String}   channelTag The tag of the channel to subscribe to.
 * @param {Function} callback   Called when the request is complete.
 */
PushBullet.prototype.subscribe = function subscribe(channelTag, callback) {
	var self = this;

	var options = {
		json: {
			channel_tag: channelTag
		}
	};

	self.request.post(PushBullet.SUBS_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Unsubscribe from a channel.
 *
 * @param {String}   subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.unsubscribe = function unsubscribe(subscriptionIden, callback) {
	var self = this;

	self.request.post(PushBullet.SUBS_END_POINT + '/' + subscriptionIden, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Mute a subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to mute.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.muteSubscription = function muteSubscription(subscriptionIden, callback) {
	this.updateSubscription(subscriptionIden, { muted: true }, callback);
};

/**
 * Unmute subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to unmute.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.unmuteSubscription = function unmuteSubscription(subscriptionIden, callback) {
	this.updateSubscription(subscriptionIden, { muted: false }, callback);
};

/**
 * Update a subscription.
 *
 * @param {String}   subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param {Object}   updates          Updates to make to subscription.
 * @param {Function} callback         Called when the request is complete.
 */
PushBullet.prototype.updateSubscription = function updateSubscription(subscriptionIden, updates, callback) {
	var self = this;

	if ( ! callback) {
		callback = updates;
	}

	var options = {
		json: updates
	};

	self.request.post(PushBullet.SUBS_END_POINT + '/' + subscriptionIden, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};

/**
 * Get information about a channel.
 *
 * @param {String}   channelTag The tag of the channel to get information about.
 * @param {Function} callback   Called when the request is complete.
 */
PushBullet.prototype.channelInfo = function channelInfo(channelTag, callback) {
	var self = this;

	var options = {
		qs: {
			tag: channelTag
		}
	};

	self.request.get(PushBullet.CHANNELS_END_POINT, options, function(error, response, body) {
		self.handleResponse(error, response, body, callback);
	});
};
