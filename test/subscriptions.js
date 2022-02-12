/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.subscriptions()', () => {
	it('should request active subscriptions', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/subscriptions')
			.query({
				active : 'true'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.subscriptions();
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});

	it('should request subscriptions with options', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/subscriptions')
			.query({
				active : 'false'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.subscriptions({
			active : false
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.subscribe()', () => {
	it('should subscribe to a channel', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/subscriptions', {
				channel_tag : 'channel-tag'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.subscribe('channel-tag');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.unsubscribe()', () => {
	it('should unsubscribe to a channel', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.delete('/subscriptions/subscription-iden')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.unsubscribe('subscription-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.muteSubscription()', () => {
	it('should mute a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/subscriptions/subscription-iden', {
				muted : true
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.muteSubscription('subscription-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.unmuteSubscription()', () => {
	it('should mute a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/subscriptions/subscription-iden', {
				muted : false
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.unmuteSubscription('subscription-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
