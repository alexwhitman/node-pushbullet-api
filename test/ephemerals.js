/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.sendSMS()', () => {
	it('should send an SMS', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/ephemerals', {
				type : 'push',
				push : {
					package_name       : 'com.pushbullet.android',
					type               : 'messaging_extension_reply',
					target_device_iden : 'target-device-iden',
					conversation_iden  : 'conversation-iden',
					message            : 'message'
				}
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.sendSMS({
			target_device_iden : 'target-device-iden',
			conversation_iden  : 'conversation-iden',
			message            : 'message'
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.sendClipboard()', () => {
	it('should send clipboard content', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/ephemerals', {
				type : 'push',
				push : {
					type               : 'clip',
					body               : 'clipboard-content',
					source_user_iden   : 'source-user-iden',
					source_device_iden : 'source-device-iden'
				}
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.sendClipboard({
			body               : 'clipboard-content',
			source_user_iden   : 'source-user-iden',
			source_device_iden : 'source-device-iden'
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.dismissEphemeral()', () => {
	it('should dismiss an ephemeral', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/ephemerals', {
				type : 'push',
				push : {
					type             : 'dismissal',
					package_name     : 'package-name',
					notification_id  : 'notification-id',
					notification_tag : 'notification-tag',
					source_user_iden : 'source-user-iden'
				}
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.dismissEphemeral({
			package_name     : 'package-name',
			notification_id  : 'notification-id',
			notification_tag : 'notification-tag',
			source_user_iden : 'source-user-iden'
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.sendEphemeral() with encryption', () => {
	it('should send an encrypted ephemeral', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/ephemerals', {
				type : 'push',
				push : {
					ciphertext : /.+/i,
					encrypted  : true
				}
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		pb.enableEncryption('password', 'user-iden');
		const response = await pb.sendEphemeral({
			option1 : 'option1',
			option2 : 'option2'
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
