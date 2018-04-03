'use strict';

/* global describe it */
var apiKey = process.env.npm_config_key;
var Pushbullet = require('../');
var p = require('path');

require('chai').should();
require('chai').assert;

if (!apiKey || apiKey.length === 0) {
	throw new Error('Missing API key, please run `npm test --key={your api key}`');
}

var pusher = new Pushbullet(apiKey);

describe('pushbullet', function () {
	this.timeout(30000);

	it('should get user information using a callback', (done) => {
		pusher.me((err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('name');
			res.should.have.property('email');
			done();
		});
	});

	it('should get user information using promises', done => {
		pusher.me().then(res => {
			res.should.be.an('object');
			res.should.have.property('name');
			res.should.have.property('email');
			done();
		}).catch(done);
	});

	it('should get chats using a callback', done => {
		pusher.chats((err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('chats');
			res.chats.should.be.an('array');
			done();
		});
	});

	it('should get chats using promises', done => {
		pusher.chats().then(res => {
			res.should.be.an('object');
			res.should.have.property('chats');
			res.chats.should.be.an('array');
			done();
		}).catch(done);
	});

	it('should create, mute, unmute and delete a chat using a callback', done => {
		pusher.createChat('test@email.com', (err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.active.should.equal(true);
			res.should.have.property('iden');

			var iden = res.iden;

			pusher.muteChat(iden, (err, res) => {
				if (err) {
					return done(err);
				}

				res.should.be.an('object');
				res.muted.should.equal(true);

				pusher.unmuteChat(iden, (err, res) => {
					if (err) {
						return done(err);
					}

					res.should.be.an('object');
					res.with.should.be.an('object');

					pusher.deleteChat(iden, (err, res) => {
						if (err) {
							return done(err);
						}

						res.should.be.an('object');
						done();
					});
				});
			});
		});
	});

	it('should create, mute, unmute and delete a chat using promises', done => {
		var iden;

		pusher.createChat('test@email.com').then(res => {
			res.should.be.an('object');
			res.active.should.equal(true);
			res.should.have.property('iden');

			iden = res.iden;
			return pusher.muteChat(iden);
		}).then(res => {
			res.should.be.an('object');
			res.muted.should.equal(true);

			return pusher.unmuteChat(iden);
		}).then(res => {
			res.should.be.an('object');
			res.with.should.be.an('object');

			return pusher.deleteChat(iden);
		}).then(res => {
			res.should.be.an('object');
			done();
		}).catch(done);
	});

	it('should list devices using a callback', done => {
		pusher.devices((err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.devices.should.be.an('array');
			done();
		});
	});

	it('should list devices using a promise', done => {
		pusher.devices().then(res => {
			res.should.be.an('object');
			res.devices.should.be.an('array');
			done();
		}).catch(done);
	});

	it('should create, update and delete a device using a callback', done => {
		pusher.createDevice({ nickname: 'node-test' }, (err, res) => {
			if (err) {
				return done(err);
			}

			var iden = res.iden;

			res.should.be.an('object');
			res.should.have.property('iden');

			pusher.updateDevice(iden, { nickname: 'node-test-update' }, (err, res) => {
				if (err) {
					return done(err);
				}

				res.should.be.an('object');
				res.nickname.should.equal('node-test-update');

				pusher.deleteDevice(iden, (err, res) => {
					if (err) {
						return done(err);
					}

					res.should.be.an('object');
					done();
				});
			});
		});
	});

	it('should create, update and delete a device using a promise', done => {
		var iden;

		pusher.createDevice({ nickname: 'node-test' }).then(res => {
			iden = res.iden;
			res.should.be.an('object');
			res.should.have.property('iden');

			return pusher.updateDevice(iden, { nickname: 'node-test-update' });
		}).then(res => {
			res.should.be.an('object');
			res.nickname.should.equal('node-test-update');

			return pusher.deleteDevice(iden);
		}).then(res => {
			res.should.be.an('object');
			done();
		}).catch(done);
	});

	it('should push a note using a callback', done => {
		pusher.note({}, 'Test', 'I\'m just a test! :)', (err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.title.should.equal('Test');
			done();
		});
	});

	it('should push a note using a proimse', done => {
		pusher.note({}, 'Test', 'I\'m just a test! :)').then(res => {
			res.should.be.an('object');
			res.title.should.equal('Test');
			done();
		}).catch(done);
	});

	it('should push a link using a callback', done => {
		pusher.link({}, 'GitHub', 'https://github.com', (err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.title.should.equal('GitHub');
			done();
		});
	});

	it('should push a link using a proimse', done => {
		pusher.link({}, 'GitHub', 'https://github.com', 'My message').then(res => {
			res.should.be.an('object');
			res.title.should.equal('GitHub');
			done();
		}).catch(done);
	});

	it('should push a file using a callback', done => {
		pusher.file({}, p.join(__dirname, 'hang-in-there.jpg'), (err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('file_url');
			res.should.have.property('file_name');
			res.should.have.property('file_type');
			done();
		});
	});

	it('should push a file using a proimse', done => {
		pusher.file({}, p.join(__dirname, 'hang-in-there.jpg')).then(res => {
			res.should.be.an('object');
			res.should.have.property('file_url');
			res.should.have.property('file_name');
			res.should.have.property('file_type');
			done();
		}).catch(done);
	});

	it('should get pushes using a callback', done => {
		pusher.history((err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('pushes');
			res.pushes.should.be.an('array');
			done();
		});
	});

	it('should get pushes using a promise', done => {
		pusher.history().then(res => {
			res.should.be.an('object');
			res.should.have.property('pushes');
			res.pushes.should.be.an('array');
			done();
		}).catch(done);
	});

	it('should dismiss a push using a callback', done => {
		pusher.note({}, 'Dismiss Test', 'Dismiss me baby', (err, res) => {
			if (err) {
				return done(err);
			}

			pusher.dismissPush(res.iden, (err, res) => {
				if (err) {
					return done(err);
				}

				res.should.be.an('object');
				res.dismissed.should.equal(true);
				done();
			});
		});
	});

	it('should dismiss a push using a promise', done => {
		pusher.note({}, 'Dismiss Test', 'Dismiss me baby')
			.then(res => pusher.dismissPush(res.iden))
			.then(res => {
				res.should.be.an('object');
				res.dismissed.should.equal(true);
				done();
			}).catch(done);
	});

	it('should delete a push using a callback', done => {
		pusher.note({}, 'Delete Test', 'Delete me baby', (err, res) => {
			if (err) {
				return done(err);
			}

			pusher.deletePush(res.iden, err => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	it('should delete a push using a promise', done => {
		pusher.note({}, 'Delete Test', 'Delete me baby')
			.then(res => pusher.deletePush(res.iden))
			.then(() => done())
			.catch(done);
	});

	it('should get subscriptions using a callback', done => {
		pusher.subscriptions((err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('subscriptions');
			res.subscriptions.should.be.an('array');
			done();
		});
	});

	it('should get subscriptions using a promise', done => {
		pusher.subscriptions({ limit: 1 }).then(res => {
			res.should.be.an('object');
			res.should.have.property('subscriptions');
			res.subscriptions.should.be.an('array');
			done();
		}).catch(done);
	});

	it('should get channel info using a callback', done => {
		pusher.channelInfo('pushbullet', (err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('recent_pushes');
			res.recent_pushes.should.be.an('array');
			done();
		});
	});

	it('should get channel info using a promise', done => {
		pusher.channelInfo('pushbullet').then(res => {
			res.should.be.an('object');
			res.should.have.property('recent_pushes');
			res.recent_pushes.should.be.an('array');
			done();
		}).catch(done);
	});

	it('should subscribe, mute, unmute, and unsubscribe to a channel using callbacks', done => {
		pusher.subscribe('xkcd', (err, res) => {
			if (err) {
				return done(err);
			}

			res.should.be.an('object');
			res.should.have.property('channel');
			res.active.should.equal(true);

			var iden = res.iden;

			pusher.muteSubscription(iden, (err, res) => {
				if (err) {
					return done(err);
				}

				res.should.be.an('object');
				res.should.have.property('channel');
				res.muted.should.equal(true);

				pusher.unmuteSubscription(iden, (err, res) => {
					if (err) {
						return done(err);
					}

					res.should.be.an('object');
					res.should.have.property('channel');

					pusher.unsubscribe(iden, err => {
						if (err) {
							return done(err);
						}

						done();
					});
				});
			});
		});
	});

	it('should subscribe, mute, unmute, and unsubscribe to a channel using promises', done => {
		var iden;

		pusher.subscribe('xkcd').then(res => {
			iden = res.iden;

			res.should.be.an('object');
			res.should.have.property('channel');
			res.active.should.equal(true);

			return pusher.muteSubscription(iden);
		}).then(res => {
			res.should.be.an('object');
			res.should.have.property('channel');
			res.muted.should.equal(true);

			return pusher.unmuteSubscription(iden);
		}).then(res => {
			res.should.be.an('object');
			res.should.have.property('channel');

			return pusher.unsubscribe(iden);
		}).then(() => {
			done();
		}).catch(done);
	});

	it('should send clipboard using a callback', done => {
		var clipOptions = {
			body: '你好！'
		};

		pusher.me((err, res) => {
			if (err) {
				return done(err);
			}

			clipOptions.source_user_iden = res.iden;

			pusher.devices((err, res) => {
				if (err) {
					return done(err);
				}

				clipOptions.source_device_iden = res.devices[0].iden;

				pusher.sendClipboard(clipOptions, err => {
					if (err.message === 'Pushbullet Pro is required to make this call.') {
						return done();
					}

					if (err) {
						return done(err);
					}

					done();
				});
			});
		});
	});

	it('should send clipboard using a promise', done => {
		var clipOptions = {
			body: '你好！'
		};

		pusher.me().then(res => {
			clipOptions.source_user_iden = res.iden;

			return pusher.devices();
		}).then(res => {
			clipOptions.source_device_iden = res.devices[0].iden;

			return pusher.sendClipboard(clipOptions);
		}).then(() => {
			done();
		}).catch(err => {
			if (err.message === 'Pushbullet Pro is required to make this call.') {
				return done();
			}

			done(err);
		});
	});

});
