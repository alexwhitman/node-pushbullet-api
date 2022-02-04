/* global describe,it */

import { fileURLToPath } from 'url';
import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.note()', () => {
	it('should push a note', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/pushes', {
				device_iden : 'device-iden',
				type        : 'note',
				title       : 'note-title',
				body        : 'note-body'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.note('device-iden', 'note-title', 'note-body');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.link()', () => {
	it('should push a link', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/pushes', {
				device_iden : 'device-iden',
				type        : 'link',
				title       : 'link-title',
				url         : 'link-url',
				body        : 'link-body'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.link('device-iden', 'link-title', 'link-url', 'link-body');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.file()', () => {
	it('should push a file', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/upload-request', {
				file_name : 'pushes.js',
				file_type : 'application/javascript'
			})
			.reply(200, {
				file_url   : 'https://dl.pushbulletusercontent.com/some-hash/pushes.js',
				upload_url : 'https://upload.pushbullet.com/upload-legacy/some-hash'
			});

		const uploadHeaders = {
			'Content-Type' : headerValue => headerValue.startsWith('multipart/form-data; boundary')
		};

		nock('https://upload.pushbullet.com', { reqheaders : uploadHeaders })
			.post('/upload-legacy/some-hash', /.*Content-Disposition: form-data;.*/gi)
			.reply(204);

		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/pushes', {
				device_iden : 'device-iden',
				type        : 'file',
				file_name   : 'pushes.js',
				file_type   : 'application/javascript',
				file_url    : 'https://dl.pushbulletusercontent.com/some-hash/pushes.js',
				body        : 'file-body'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.file('device-iden', fileURLToPath(import.meta.url), 'file-body');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.history()', () => {
	it('should request push history', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/pushes')
			.query({
				active         : 'true',
				modified_after : '0'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.history();
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});

	it('should request push history with options', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/pushes')
			.query({
				active         : 'false',
				modified_after : '123',
				cursor         : 'some-cursor',
				limit          : '10'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.history({
			active         : false,
			modified_after : 123,
			cursor         : 'some-cursor',
			limit          : 10
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.dismissPush()', () => {
	it('should dismiss a push', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/pushes/push-iden', {
				dismissed : true
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.dismissPush('push-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.deletePush()', () => {
	it('should delete a push', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.delete('/pushes/push-iden')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.deletePush('push-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.deleteAllPushes()', () => {
	it('should delete all pushes', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.delete('/pushes')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.deleteAllPushes();
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
