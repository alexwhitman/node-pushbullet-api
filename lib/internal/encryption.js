var forge = require('node-forge');

/**
 * Encryption module for the PushBullet API.
 *
 * The encryption key is created from a user-supplied password and passed through PBKDF2.
 *
 * @param {String} encryptionPassword End-to-End encryption password set by the user.
 * @param {String} userIden           The iden of the user (aquired e.g. by the /me request).
 */
function Encryption(encryptionPassword, userIden) {
	var derivedKeyLength = 32;
	var iterations = 30000;
	var pseudorandomFunction = forge.md.sha256.create();
	var encryptionKey = forge.pkcs5.pbkdf2(encryptionPassword, userIden, iterations, derivedKeyLength, pseudorandomFunction);

	this.encryptionKey = encryptionKey;
}

module.exports = Encryption;

/**
 * Decodes a base-64 encoded string.
 *
 * @param {String} input A base-64 encoded message to be decoded.
 * @returns Decoded string in a binary form.
 */
Encryption.prototype.atob = function atob(input) {
	return new Buffer(input, 'base64').toString('binary');
};

/**
 * Encodes a string in base-64.
 *
 * @param {String} input A binary string to be encoded.
 * @returns Base-64 encoded string.
 */
Encryption.prototype.btoa = function btoa(input) {
	return new Buffer(input, 'binary').toString('base64');
};

/**
 * Encrypts a message.
 *
 * @param   {String} message A message to encrypt.
 * @returns {String} Encrypted message
 */
Encryption.prototype.encrypt = function encrypt(message) {
	var key = this.encryptionKey;

	var initializationVector = forge.random.getBytes(12);
	var cipher = forge.cipher.createCipher('AES-GCM', key);
	cipher.start({ iv: initializationVector });
	cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
	cipher.finish();

	var tag = cipher.mode.tag.getBytes();
	var encryptedMessage = cipher.output.getBytes();

	var result = this.btoa('1' + tag + initializationVector + encryptedMessage);

	return result;
};

/**
 * Decrypts a message.
 *
 * @param  {String} message A message to decrypt.
 * @return {String} Decrypted message.
 */
Encryption.prototype.decrypt = function decrypt(message) {
	var binaryMessage = this.atob(message);
	var key = this.encryptionKey;
	var version = binaryMessage.substr(0, 1);
	var tag = binaryMessage.substr(1, 16);
	var initializationVector = binaryMessage.substr(17, 12);
	var encryptedMessage = binaryMessage.substr(29);

	if (version !== '1') {
		throw 'invalid version';
	}

	var decipher = forge.cipher.createDecipher('AES-GCM', key);
	decipher.start({
		iv: initializationVector,
		tag: tag
	});
	decipher.update(forge.util.createBuffer(encryptedMessage));
	decipher.finish();

	var result = decipher.output.toString('utf8');
	return result;
};