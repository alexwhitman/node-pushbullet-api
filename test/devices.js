/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.devices()', () => {
	it('should request active devices', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/devices')
			.query({
				active : 'true'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.devices();
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});

	it('should request devices with options', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/devices')
			.query({
				active : 'false'
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.devices({
			active : false
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.createDevice()', () => {
	it('should create a device', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/devices', {
				nickname : 'device-nickname',
				model    : 'device-model',
				has_sms  : false
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.createDevice({
			nickname : 'device-nickname',
			model    : 'device-model',
			has_sms  : false
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.updateDevice()', () => {
	it('should update a device', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.post('/devices/device-iden', {
				nickname : 'device-nickname',
				model    : 'device-model',
				has_sms  : false
			})
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.updateDevice('device-iden', {
			nickname : 'device-nickname',
			model    : 'device-model',
			has_sms  : false
		});
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});

describe('PushBullet.deleteDevice()', () => {
	it('should update a device', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.delete('/devices/device-iden')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.deleteDevice('device-iden');
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
