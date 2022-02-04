/* global describe,it */

import nock        from 'nock';
import PushBullet  from '../lib/pushbullet.js';
import { should }  from 'chai';
should();

const accessToken = 'test-access-token';
const requestHeaders = {
	'Access-Token' : accessToken
};

describe('PushBullet.me()', () => {
	it('should request user details', async () => {
		nock(PushBullet.API_BASE, { reqheaders : requestHeaders })
			.get('/users/me')
			.reply(200, {});

		const pb = new PushBullet(accessToken);
		const response = await pb.me();
		response.status.should.equal(200);

		const j = await response.json();
		j.should.be.an.an('object');
	});
});
