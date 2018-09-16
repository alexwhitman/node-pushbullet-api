# PushBullet API

A Node.js module for using the [PushBullet REST API](https://www.pushbullet.com/api).

## Usage

This module is very simple to use.  All you need is your PushBullet API key and you can begin pushing.

```javascript
var PushBullet = require('pushbullet');
var pusher = new PushBullet('YOUR-API-KEY');

pusher.devices(function(error, response) {
	// response is the JSON response from the API
});

pusher.note(deviceParams, noteTitle, noteBody, function(error, response) {
	// response is the JSON response from the API
});
```

### Target devices

The push functions (`note`, `link`, `file`) have a `deviceParams` parameter which can be several types:

- If it is a string containing an '@' it is treated as an email address.
- If it is a string not containing an '@' it is treated as a device iden.
- If it is a number it is treated as a device id.
- If it is an object it is assumed to have one of the 'target parameters' as defined on https://docs.pushbullet.com/v2/pushes/ as an attribute.  It can also have an optional `source_device_iden` attribute.  If the object is empty, `{}`, then the push is sent to all devices.

### Callbacks

Each callback receives two arguments.  For a successful request the first argument will be `null` or `undefined`
and the second argument will be the parsed JSON response from the API.

If an error occurs at any part of the request the first argument will be an Error object.

### Promises

Promises are supported and can be used in place of the callback method.

```javascript
pusher.devices().then(function(devices) {
	// devices is the JSON response from the API
});
```

## API

### new PushBullet(apiKey, options)

Creates a new PushBullet object.

The `apiKey` parameter is the string API key provided by PushBullet.
The `options` parameter is optional and has one attribute:

- `fullResponses` (default `false`): By default, only the response body is returned.  Setting this to true will make the full response to be returned, useful if access to the headers are required.

### PushBullet.me(callback);

Get the current user's information.

```javascript
pusher.me(function(err, response) {});
```

### PushBullet.devices([options], callback)

Retrieves a list of pushable devices.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `active` is used to restrict the results to only active devices.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
var options = {
	limit: 10
};

pusher.devices(options, function(error, response) {});
```

### PushBullet.createDevice(deviceOptions, callback)

Creates a new device.

```javascript
var deviceOptions = {
	nickname: 'node-app'
};

pusher.createDevice(deviceOptions, function(error, response) {});
```

### PushBullet.updateDevice(deviceIden, deviceOptions, callback)

Creates a new device.

```javascript
var deviceOptions = {
	nickname: 'node-app'
};

pusher.updateDevice(deviceIden, deviceOptions, function(error, response) {});
```

### PushBullet.deleteDevice(deviceIden, callback)

Delete a device.

```javascript
pusher.deleteDevice('u1qSJddxeKwOGuGW', function(error, response) {});
```

### PushBullet.note(deviceParams, noteTitle, noteBody, callback)

Push a note to the specified device.

```javascript
pusher.note('u1qSJddxeKwOGuGW', 'New Note', 'Note body text', function(error, response) {});
```

### PushBullet.link(deviceParams, name, url, body, callback)

Push a link to the specified device.

```javascript
pusher.link('u1qSJddxeKwOGuGW', 'GitHub', 'https://github.com/', 'Note body text', function(error, response) {});
```

### PushBullet.file(deviceParams, filePath, message, callback)

Push a file to the specified device.

```javascript
pusher.file('u1qSJddxeKwOGuGW', '/path/to/file', 'Important file!', function(error, response) {});
```

### PushBullet.dismissPush(pushIden, callback)

Dismiss a push.

```javascript
pusher.dismissPush('udhrSpjAewzdwpCC', function(error, response) {});
```

### PushBullet.deletePush(pushIden, callback)

Delete a push.

```javascript
pusher.deletePush('udhrSpjAewzdwpCC', function(error, response) {});
```

### PushBullet.deleteAllPushes(callback)

Delete all pushes associated with the current account.

```javascript
pusher.deleteAllPushes(function(error, response) {});
```

### PushBullet.history([options], callback)

Get the push history.

The `options` parameter can use three attributes `cursor`, `limit` and
`modified_after` to control the data returned.

- `active` is used to only select undeleted pushes. Defaults to true if not specified.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.
- `modified_after` should be a timestamp. Defaults to 0 if not specified.

```javascript
var options = {
	limit: 10,
	modified_after: 1400000000.00000
};

pusher.history(options, function(error, response) {})
```

### PushBullet.subscriptions([options], callback)

Get a list of current subscriptions.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `active` is used to restrict the results to only active devices.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
var options = {
	limit: 10
};

pusher.subscriptions(options, function(error, response) {});
```

### PushBullet.subscribe(channelTag, callback)

Subscribe to a channel.

```javascript
pusher.subscribe('jblow', function(error, response) {});
```

### PushBullet.unsubscribe(subscriptionIden, callback)

Subscribe to a channel.

```javascript
pusher.unsubscribe('udprOsjAsLtNTRAG', function(error, response) {});
```

### PushBullet.muteSubscription(subscriptionIden, callback)

Mute a subscription.

```javascript
pusher.muteSubscription('udprOsjAsLtNTRAG', function(error, response) {});
```

### PushBullet.unmuteSubscription(subscriptionIden, callback)

Unmute a subscription.

```javascript
pusher.unmuteSubscription('udprOsjAsLtNTRAG', function(error, response) {});
```

### PushBullet.channelInfo(channelTag, callback)

Get information about a channel.

```javascript
pusher.channelInfo('jblow', function(error, response) {});
```

### PushBullet.chats([options], callback)

Get a list of current chats.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `active` is used to restrict the results to only active devices.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
var options = {
	limit: 10
};

pusher.chats(options, function(error, response) {});
```

### PushBullet.createChat(email, callback)

Create a new chat.

```javascript
pusher.createChat('a@b.com', function(error, response) {});
```

### PushBullet.deleteChat(chatIden, callback)

Delete a chat.

```javascript
pusher.deleteChat('udprOsjAsLtNTRAG', function(error, response) {});
```

### PushBullet.muteChat(chatIden, callback)

Mute a chat.

```javascript
pusher.muteChat('udprOsjAsLtNTRAG', function(error, response) {});
```

### PushBullet.unmuteChat(chatIden, callback)

Unmute a chat.

```javascript
pusher.unmuteChat('udprOsjAsLtNTRAG', function(error, response) {});
```

### PushBullet.sendSMS(options, callback)

Send an SMS through a device.

```javascript
var options = {
	source_user_iden: 'ujpah72o0',              // The user iden of the user sending this message
	target_device_iden: 'ujpah72o0sjAoRtnM0jc', // The iden of the device corresponding to the phone that should send the SMS
	conversation_iden: '+1 303 555 1212',       // Phone number to send the SMS to
	message: 'Hello!'                           // The SMS message to send
};

pusher.sendSMS(options, function(error, response) {});
```

### PushBullet.sendClipboard(options, callback)

Send clipboard content.

```javascript
var options = {
    source_user_iden: "ujpah72o0",              // The iden of the user sending this message
    source_device_iden: "ujpah72o0sjAoRtnM0jc", // The iden of the device sending this message
    body: "http://www.google.com",              // The text to copy to the clipboard
};

pusher.sendClipboard(options, function(error, response) {});
```

### PushBullet.dismissEphemeral(options, callback)

Dismiss an ephemeral.

```javascript
var options = {
	package_name: 'com.pushbullet.android', // Set to the package_name field from the mirrored notification
	notification_id: '-8',                  // Set to the notification_id field from the mirrored notification
	notification_tag: null,                 // Set to the notification_tag field from the mirrored notification
	source_user_iden: 'ujpah72o0',          // Set to the source_user_iden field from the mirrored notification
};

pusher.dismissEphemeral(options, function(error, response) {});
```

### PushBullet.stream()

Returns a new stream listener which will emit events from the stream.

```javascript
var stream = pusher.stream();
```

#### connect()

Connects to the stream.

```javascript
stream.connect();
```

#### close()

Disconnects from the stream.

```javascript
stream.close();
```

#### Events

##### connect

Emitted when the stream has connected.

```javascript
stream.on('connect', function() {
	// stream has connected
});
```

##### close

Emitted when the stream has disconnected.

```javascript
stream.on('close', function() {
	// stream has disconnected
});
```

##### error

Emitted when there is a connection or streaming error.

```javascript
stream.on('error', function(error) {
	// stream error
});
```

##### message

Emitted when a message is received from the stream.  `message` will be emitted for all messages
but you can listen for specific messages with `nop`, `tickle` and `push`.

```javascript
stream.on('message', function(message) {
	// message received
});
```

##### nop

Emitted when the keep-alive 'no-operation' message is received.

```javascript
stream.on('nop', function() {
	// nop message received
});
```

##### tickle

Emitted when the `tickle` message is received.

```javascript
stream.on('tickle', function(type) {
	// tickle message received
});
```

##### push

Emited when the `push` message is received.

```javascript
stream.on('push', function(push) {
	// push message received
});
```

### PushBullet.enableEncryption(encryptionPassword, userIden)

Enables End-to-End encryption.

```javascript
pusher.me(function(error, user) {
	// needed to call me() to gather user iden
	pusher.enableEncryption('YOUR-END-TO-END-PASSWORD', user.iden);

	var stream = pusher.stream();

	stream.on('message', function(message) {
		console.log(message); // message is decrypted automatically
	});

	stream.connect();

	var options = {
		source_user_iden: 'ujpah72o0',
		target_device_iden: 'ujpah72o0sjAoRtnM0jc',
		conversation_iden: '+1 303 555 1212',
		message: 'Hello!'
	};

	pusher.sendSMS(options, function(error, response) {}); // options are encrypted automatically
});
```
