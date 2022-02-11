import forge from 'node-forge';

/**
 * Encryption module for the PushBullet API.
 *
 * The encryption key is created from a user-supplied password and passed through PBKDF2.
 */
export default class Encryption {
	/**
	 * @param {String} encryptionPassword End-to-End encryption password set by the user.
	 * @param {String} userIden           The iden of the user (aquired e.g. by the /me request).
	 */
	constructor(encryptionPassword, userIden) {
		const derivedKeyLength = 32;
		const iterations = 30000;
		const pseudorandomFunction = forge.md.sha256.create();
		const encryptionKey = forge.pkcs5.pbkdf2(encryptionPassword, userIden, iterations, derivedKeyLength, pseudorandomFunction);

		this.encryptionKey = encryptionKey;
	}

	/**
	 * Decodes a base-64 encoded string.
	 *
	 * @param   {String} input A base-64 encoded message to be decoded.
	 * @returns {Buffer}       Decoded string in a binary form.
	 */
	atob(input) {
		return new Buffer.from(input, 'base64').toString('binary');
	}

	/**
	 * Encodes a string in base-64.
	 *
	 * @param   {String} input A binary string to be encoded.
	 * @returns {Buffer}       Base-64 encoded string.
	 */
	btoa(input) {
		return new Buffer.from(input, 'binary').toString('base64');
	}

	/**
	 * Encrypts a message.
	 *
	 * @param   {String} message A message to encrypt.
	 * @returns {String}         Encrypted message
	 */
	encrypt(message) {
		const key = this.encryptionKey;

		const initializationVector = forge.random.getBytes(12);
		const cipher = forge.cipher.createCipher('AES-GCM', key);
		cipher.start({ iv : initializationVector });
		cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
		cipher.finish();

		const tag = cipher.mode.tag.getBytes();
		const encryptedMessage = cipher.output.getBytes();

		const result = this.btoa('1' + tag + initializationVector + encryptedMessage);

		return result;
	}

	/**
	 * Decrypts a message.
	 *
	 * @param  {String} message A message to decrypt.
	 * @return {String}         Decrypted message.
	 */
	decrypt(message) {
		const binaryMessage = this.atob(message);
		const key = this.encryptionKey;
		const version = binaryMessage.substr(0, 1);
		const tag = binaryMessage.substr(1, 16);
		const initializationVector = binaryMessage.substr(17, 12);
		const encryptedMessage = binaryMessage.substr(29);

		if (version !== '1') {
			throw new Error('Invalid cipher version');
		}

		const decipher = forge.cipher.createDecipher('AES-GCM', key);
		decipher.start({
			iv  : initializationVector,
			tag : tag
		});
		decipher.update(forge.util.createBuffer(encryptedMessage));
		decipher.finish();

		const result = decipher.output.toString('utf8');
		return result;
	}
}
