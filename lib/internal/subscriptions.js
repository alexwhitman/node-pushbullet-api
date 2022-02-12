import PushBullet from '../pushbullet.js';

/**
 * Get a list of current subscriptions.
 *
 * @param   {Object}  options Optional options object.
 * @returns {Promise}
 */
PushBullet.prototype.subscriptions = async function subscriptions(options) {
	options = options ? options : {};

	if (options.active === undefined) {
		options.active = true;
	}

	return this.getList(PushBullet.SUBS_END_POINT, options);
};

/**
 * Subscribe to a channel.
 *
 * @param   {String}  channelTag The tag of the channel to subscribe to.
 * @returns {Promise}
 */
PushBullet.prototype.subscribe = async function subscribe(channelTag) {
	const options = {
		json : {
			channel_tag : channelTag
		}
	};

	return this.makeRequest('post', PushBullet.SUBS_END_POINT, options);
};

/**
 * Unsubscribe from a channel.
 *
 * @param   {String}  subscriptionIden The iden of the subscription to ubsubscribe from.
 * @returns {Promise}
 */
PushBullet.prototype.unsubscribe = async function unsubscribe(subscriptionIden) {
	return this.makeRequest('delete', PushBullet.SUBS_END_POINT + '/' + subscriptionIden, null);
};

/**
 * Mute a subscription.
 *
 * @param   {String}  subscriptionIden The iden of the subscription to mute.
 * @returns {Promise}
 */
PushBullet.prototype.muteSubscription = async function muteSubscription(subscriptionIden) {
	return this.updateSubscription(subscriptionIden, { muted : true });
};

/**
 * Unmute subscription.
 *
 * @param   {String}  subscriptionIden The iden of the subscription to unmute.
 * @returns {Promise}
 */
PushBullet.prototype.unmuteSubscription = async function unmuteSubscription(subscriptionIden) {
	return this.updateSubscription(subscriptionIden, { muted : false });
};

/**
 * Update a subscription.
 *
 * @param   {String}  subscriptionIden The iden of the subscription to ubsubscribe from.
 * @param   {Object}  updates          Updates to make to subscription.
 * @returns {Promise}
 */
PushBullet.prototype.updateSubscription = async function updateSubscription(subscriptionIden, updates) {
	const options = {
		json : updates
	};

	return this.makeRequest('post', PushBullet.SUBS_END_POINT + '/' + subscriptionIden, options);
};
