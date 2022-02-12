/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.createChannel()', () => {
	it('should create a channel', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/channels', {
				tag          : 'channel-tag',
				name         : 'channel-name',
				description  : 'channel-description',
				image_url    : 'image-url',
				website_url  : 'website-url',
				feed_url     : 'feed-url',
				feed_filters : [{
					field       : 'title',
					operator    : 'contains',
					value       : 'test',
					ignore_case : 'true'
				}],
				subscribe : 'true'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.createChannel({
			tag          : 'channel-tag',
			name         : 'channel-name',
			description  : 'channel-description',
			image_url    : 'image-url',
			website_url  : 'website-url',
			feed_url     : 'feed-url',
			feed_filters : [{
				field       : 'title',
				operator    : 'contains',
				value       : 'test',
				ignore_case : 'true'
			}],
			subscribe : 'true'
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.channelInfo()', () => {
	it('should mute a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/channel-info')
			.query({ tag : 'channel-tag' })
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.channelInfo('channel-tag');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
