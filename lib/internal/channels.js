import PushBullet from '../pushbullet.js';

/**
 * Create a new channel.
 *
 * @param   {Object}  channelOptions Object of channel options.
 * @returns {Promise}
 */
PushBullet.prototype.createChannel = async function createChannel(channelOptions) {
	return this.makeRequest('post', PushBullet.CHANNELS_END_POINT, { json : channelOptions });
};

/**
 * Get information about a channel.
 *
 * @param   {String} channelTag The tag of the channel to get information about.
 * @returns {Promise}
 */
PushBullet.prototype.channelInfo = async function channelInfo(channelTag) {
	const options = {
		qs : {
			tag : channelTag
		}
	};

	return this.makeRequest('get', PushBullet.CHANNEL_INFO_END_POINT, options);
};
