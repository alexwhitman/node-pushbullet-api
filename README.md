# PushBullet API

A Node.js module for using the [PushBullet REST API](https://www.pushbullet.com/api).

## Usage

This module is very simple to use.  All you need is your PushBullet API key and you can begin pushing.

```javascript
let PushBullet = require('pushbullet');
let pusher = new PushBullet('YOUR-API-KEY');

let response = await pusher.devices();

let response = await pusher.note(deviceParams, noteTitle, noteBody);
```

### Target devices

The push functions (`note`, `link`, `file`) have a `deviceParams` parameter which can be several types:

- If it is a string containing an '@' it is treated as an email address.
- If it is a string not containing an '@' it is treated as a device iden.
- If it is a number it is treated as a device id.
- If it is an object it is assumed to have one of the 'target parameters' as defined on https://docs.pushbullet.com/v2/pushes/ as an attribute.  It can also have an optional `source_device_iden` attribute.  If the object is empty, `{}`, then the push is sent to all devices.

### Async/Await

Version 2 of the module supported callback and promise based execution. Version 3 uses async/await. Callbacks can still be used by utilising `util.callbackify()`.

```javascript
let response = await pusher.devices();
console.log(await response.json());
```

## API

### new PushBullet(apiKey)

Creates a new PushBullet object.

The `apiKey` parameter is the string API key provided by PushBullet.

### PushBullet.me();

Get the current user's information.

```javascript
await pusher.me();
```

### PushBullet.devices([options])

Retrieves a list of pushable devices.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `active` is used to restrict the results to only active devices.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
let options = {
	limit: 10
};

await pusher.devices(options);
```

### PushBullet.createDevice(deviceOptions)

Creates a new device.

```javascript
let deviceOptions = {
	nickname: 'node-app'
};

await pusher.createDevice(deviceOptions);
```

### PushBullet.updateDevice(deviceIden, deviceOptions)

Creates a new device.

```javascript
let deviceOptions = {
	nickname: 'node-app'
};

await pusher.updateDevice(deviceIden, deviceOptions);
```

### PushBullet.deleteDevice(deviceIden)

Delete a device.

```javascript
await pusher.deleteDevice('u1qSJddxeKwOGuGW');
```

### PushBullet.note(deviceParams, noteTitle, noteBody)

Push a note to the specified device.

```javascript
await pusher.note('u1qSJddxeKwOGuGW', 'New Note', 'Note body text');
```

### PushBullet.link(deviceParams, name, url, body)

Push a link to the specified device.

```javascript
await pusher.link('u1qSJddxeKwOGuGW', 'GitHub', 'https://github.com/', 'Note body text');
```

### PushBullet.file(deviceParams, filePath, message)

Push a file to the specified device.

```javascript
await pusher.file('u1qSJddxeKwOGuGW', '/path/to/file', 'Important file!');
```

### PushBullet.dismissPush(pushIden)

Dismiss a push.

```javascript
await pusher.dismissPush('udhrSpjAewzdwpCC');
```

### PushBullet.deletePush(pushIden)

Delete a push.

```javascript
await pusher.deletePush('udhrSpjAewzdwpCC');
```

### PushBullet.deleteAllPushes(callback)

Delete all pushes associated with the current account.

```javascript
await pusher.deleteAllPushes(function(error, response) {});
```

### PushBullet.history([options])

Get the push history.

The `options` parameter can use three attributes `cursor`, `limit` and
`modified_after` to control the data returned.

- `active` is used to only select undeleted pushes. Defaults to true if not specified.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.
- `modified_after` should be a timestamp. Defaults to 0 if not specified.

```javascript
let options = {
	limit: 10,
	modified_after: 1400000000.00000
};

await pusher.history(options)
```

### PushBullet.subscriptions([options])

Get a list of current subscriptions.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `active` is used to restrict the results to only active devices.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
let options = {
	limit: 10
};

await pusher.subscriptions(options);
```

### PushBullet.subscribe(channelTag)

Subscribe to a channel.

```javascript
await pusher.subscribe('jblow');
```

### PushBullet.unsubscribe(subscriptionIden)

Subscribe to a channel.

```javascript
await pusher.unsubscribe('udprOsjAsLtNTRAG');
```

### PushBullet.muteSubscription(subscriptionIden)

Mute a subscription.

```javascript
await pusher.muteSubscription('udprOsjAsLtNTRAG');
```

### PushBullet.unmuteSubscription(subscriptionIden)

Unmute a subscription.

```javascript
await pusher.unmuteSubscription('udprOsjAsLtNTRAG');
```

### PushBullet.channelInfo(channelTag)

Get information about a channel.

```javascript
await pusher.channelInfo('jblow');
```

### PushBullet.chats([options])

Get a list of current chats.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `active` is used to restrict the results to only active devices.
- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
let options = {
	limit: 10
};

await pusher.chats(options);
```

### PushBullet.createChat(email)

Create a new chat.

```javascript
await pusher.createChat('a@b.com');
```

### PushBullet.deleteChat(chatIden)

Delete a chat.

```javascript
await pusher.deleteChat('udprOsjAsLtNTRAG');
```

### PushBullet.muteChat(chatIden)

Mute a chat.

```javascript
await pusher.muteChat('udprOsjAsLtNTRAG');
```

### PushBullet.unmuteChat(chatIden)

Unmute a chat.

```javascript
await pusher.unmuteChat('udprOsjAsLtNTRAG');
```

### PushBullet.createText(deviceIden, addresses, message, [options])

Create a new text.

The `options` parameter can be used to add additional information to the text request.

- `file_url` is a URL of a file to send with the text.
- `file_type` is the mime type of the file being sent. Required if `file_url` is used.

Other options are available, see https://docs.pushbullet.com/#text

```javascript
await pusher.createText('udprOsjAsLtNTRAG', '+13035551212', 'Test Message', {});
```

### PushBullet.updateText(textIden, options)

Update a chat.

`options` is an object representing the text attributes to update.
See https://docs.pushbullet.com/#text for the available attributes and structure.

```javascript
await pusher.updateText('udprOsjAsLtNTRAG', {});
```

### PushBullet.deleteText(textIden)

Delete a text.

```javascript
await pusher.deleteText('udprOsjAsLtNTRAG');
```

### PushBullet.sendSMS(options)

Send an SMS through a device.

```javascript
let options = {
	source_user_iden: 'ujpah72o0',              // The user iden of the user sending this message
	target_device_iden: 'ujpah72o0sjAoRtnM0jc', // The iden of the device corresponding to the phone that should send the SMS
	conversation_iden: '+1 303 555 1212',       // Phone number to send the SMS to
	message: 'Hello!'                           // The SMS message to send
};

await pusher.sendSMS(options);
```

### PushBullet.sendClipboard(options)

Send clipboard content.

```javascript
let options = {
    source_user_iden: "ujpah72o0",              // The iden of the user sending this message
    source_device_iden: "ujpah72o0sjAoRtnM0jc", // The iden of the device sending this message
    body: "http://www.google.com",              // The text to copy to the clipboard
};

await pusher.sendClipboard(options);
```

### PushBullet.dismissEphemeral(options)

Dismiss an ephemeral.

```javascript
let options = {
	package_name: 'com.pushbullet.android', // Set to the package_name field from the mirrored notification
	notification_id: '-8',                  // Set to the notification_id field from the mirrored notification
	notification_tag: null,                 // Set to the notification_tag field from the mirrored notification
	source_user_iden: 'ujpah72o0',          // Set to the source_user_iden field from the mirrored notification
};

await pusher.dismissEphemeral(options);
```

### PushBullet.stream()

Returns a new stream listener which will emit events from the stream.

```javascript
let stream = pusher.stream();
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

	let stream = pusher.stream();

	stream.on('message', function(message) {
		console.log(message); // message is decrypted automatically
	});

	stream.connect();

	let options = {
		source_user_iden: 'ujpah72o0',
		target_device_iden: 'ujpah72o0sjAoRtnM0jc',
		conversation_iden: '+1 303 555 1212',
		message: 'Hello!'
	};

	await pusher.sendSMS(options); // options are encrypted automatically
});
```
