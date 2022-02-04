/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.chats()', () => {
	it('should request active chats', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/chats')
			.query({
				active : 'true'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.chats();
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});

	it('should request chats with options', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/chats')
			.query({
				active : 'false'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.chats({
			active : false
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.createChat()', () => {
	it('should create a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/chats', {
				email : 'test@test.com'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.createChat('test@test.com');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.muteChat()', () => {
	it('should mute a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/chats/chat-iden', {
				muted : true
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.muteChat('chat-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.unmuteChat()', () => {
	it('should mute a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/chats/chat-iden', {
				muted : false
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.unmuteChat('chat-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.deleteChat()', () => {
	it('should delete a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.delete('/chats/chat-iden')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.deleteChat('chat-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
