/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.createText()', () => {
	it('should create a text', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/texts', {
				data : {
					target_device_iden : 'device-iden',
					addresses          : [ '123-456-789' ],
					message            : 'text-message',
					file_type          : 'type-of-file'
				},
				file_url : 'url-to-file'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.createText('device-iden', '123-456-789', 'text-message', {
			file_url  : 'url-to-file',
			file_type : 'type-of-file'
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.updateText()', () => {
	it('should update a text', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/texts/text-iden', {
				data : {
					message : 'updated-message'
				}
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.updateText('text-iden', {
			data : {
				message : 'updated-message'
			}
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.deleteText()', () => {
	it('should delete a chat', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.delete('/texts/text-iden')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.deleteText('text-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
