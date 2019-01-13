## Changelog

### 2.4.0

- Reconnect to websocket stream if disconnected.

### 2.3.0

- Switch to `ws` module for the websocket stream.
- Fix `close` on stream connection to actually close.
- Add `fullResponses` option to return response objects from requests.

### 2.2.0

- Add promise support.

### 2.1.0

- Add end to end encryption support.
- Support the `body` parameter for the `link` push type.

### 2.0.0

**Note that this major version release contains backwards incompatible changes.**

- Remove support for deprecated `list` and `address` push types.
- Add `deleteAllPushes` function.
- Use `Access-Token` header for authentication.
- Remove Contacts functions.
- Rename `updatePush` to `dismissPush`.
- Add `updateDevice` function.
- Change signature of `createDevice` to take an Object of device options.
- Add `muteSubscription` and `unmuteSubscription` functions.
- Default `devices` to active only.
- Default `subscriptions` to active only.
- Add chats functions.
- Add ephemerals support for sending SMS messages, clipboard messages and dismissals.

### 1.4.3

- Check file existence before trying to push.

### 1.4.2

- Fix error message handling.

### 1.4.1

- Fix usage of `file`.

### 1.4.0

- Add support for subscriptions API.
- Update `updatePush` so that lists can be updated.
- Add support for more target types.
- Fix missing parameter in `contacts` function.

### 1.3.0

- Add options parameter to `contacts`, `devices` and `history` to control responses.

### 1.2.0

- Add `createContact` function.
- Add `updatePush` function.

### 1.1.0

- Add `createDevice` function.

### 1.0.0

- Upgrade to and support version 2 of the API.

### 0.5.0

- Set request defaults locally so multiple instances can be used.

### 0.4.0

- Support and prefer using device IDENs over device IDs.

### 0.3.0

- Use JSON post body rather than form encoding. Fixes empty lists.

### 0.2.0

- Update API URL

### 0.1.0

- Initial release
