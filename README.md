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

The push functions (`note`, `address`, `list`, `link`, `file`) have a `deviceParams` parameter which can be several types:

- If it is a string containing an '@' it is treated as an email address.
- If it is a string not containing an '@' it is treated as a device iden.
- If it is a number it is treated as a device id.
- If it is an object it is assumed to have one of the 'target parameters' as defined on https://docs.pushbullet.com/v2/pushes/ as an attribute.  It can also have an optional `source_device_iden` attribute.

## Callbacks

Each callback receives two arguments.  For a successful request the first argument will be `null` or `undefined`
and the second argument will be the parsed JSON response from the API.

If an error occurs at any part of the request the first argument will be an Error object.

## API

### PushBullet.me(callback);

Get the current user's information.

```javascript
pusher.me(function(err, response) {});
```

### PushBullet.devices([options], callback)

Retrieves a list of pushable devices.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
var options = {
	limit: 10
};

pusher.devices(options, function(error, response) {});
```

### PushBullet.createDevice(nickname, callback)

Creates a new device.

```javascript
pusher.createDevice('Device name', function(error, response) {});
```

### PushBullet.deleteDevice(deviceIden, callback)

Delete a device.

```javascript
pusher.deleteDevice('u1qSJddxeKwOGuGW', function(error, response) {});
```

### PushBullet.contacts([options], callback)

Retrieves a list of pushable contacts.

The `options` parameter can use two attributes `cursor` and`limit`
to control the data returned.

- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.

```javascript
var options = {
	limit: 10
};

pusher.contacts(options, function(error, response) {});
```

### PushBullet.createContact(name, email, callback)

Create a contact.

```javascript
pusher.createContact('Bob', 'bob@test.com', function(error, response) {});
```

### PushBullet.deleteContact(contactIden, callback)

Delete a contact.

```javascript
pusher.deleteContact('ubdcjAfszs0Smi', function(error, response) {});
```

### PushBullet.note(deviceParams, noteTitle, noteBody, callback)

Push a note to the specified device.

```javascript
pusher.note('u1qSJddxeKwOGuGW', 'New Note', 'Note body text', function(error, response) {});
```

### PushBullet.address(deviceParams, name, address, callback)

Push an address to the specified device.

```javascript
pusher.address('u1qSJddxeKwOGuGW', 'Fake Address', '10 Fake Street, Fakesville', function(error, response) {});
```

### PushBullet.list(deviceParams, name, listItems, callback)

Push a list to the specified device.

```javascript
var shoppingList = [
	'steaks',
	'sausages',
	'burgers',
	'buns',
	'beer'
];
pusher.list('u1qSJddxeKwOGuGW', 'BBQ', shoppingList, function(error, response) {});
```

### PushBullet.link(deviceParams, name, url, callback)

Push a link to the specified device.

```javascript
pusher.link('u1qSJddxeKwOGuGW', 'GitHub', 'https://github.com/', function(error, response) {});
```

### PushBullet.file(deviceParams, filePath, message, callback)

Push a file to the specified device.

```javascript
pusher.file('u1qSJddxeKwOGuGW', '/path/to/file', 'Important file!', function(error, response) {});
```

### PushBullet.updatePush(pushIden, updates, callback)

Update a push.

Use to dismiss pushes or to update lists.

```javascript
var updates = {
	dismissed: true,
	items: [
		{
			text: 'steaks',
			checked: true
		}
		{
			text: 'sausages',
			checked: true
		}
		{
			text: 'burgers',
			checked: true
		}
		{
			text: 'buns',
			checked: true
		}
		{
			text: 'beer',
			checked: true
		}
	]
}

pusher.updatePush('udhrSpjAewzdwpCC', updates, function(error, response) {});
```

### PushBullet.deletePush(pushIden, callback)

Delete a push.

```javascript
pusher.deletePush('udhrSpjAewzdwpCC', function(error, response) {});
```

### PushBullet.history([options], callback)

Get the push history.

The `options` parameter can use three attributes `cursor`, `limit` and
`modified_after` to control the data returned.

- `cursor` is used to select the page if the results have been paginated.
- `limit` is used to limit the number of objects in the reponse.
- `modified_after` should be a timestamp.

```javascript
var options = {
	limit: 10,
	modified_after: 1400000000.00000
};

pusher.history(options, function(error, response) {})
```

### PushBullet.subscriptions(callback)

Get a list of current subscriptions.

```javascript
pusher.subscriptions(function(error, response) {});
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

### PushBullet.channelInfo(channelTag, callback)

Get information about a channel.

```javascript
pusher.channelInfo('jblow', function(error, response) {});
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
