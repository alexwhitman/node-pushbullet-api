import fetch, { FormData } from 'node-fetch';
import fs                  from 'fs';
import mime                from 'mime';
import path                from 'path';
import PushBullet          from '../pushbullet.js';

/**
 * Push a note to a device.
 *
 * @param   {String}  deviceParams Push device parameters. See push().
 * @param   {String}  title        Title of note.
 * @param   {String}  body         Body of note.
 * @returns {Promise}
 */
PushBullet.prototype.note = async function note(deviceParams, title, body) {
	const pushParameters = {
		type  : 'note',
		title : title,
		body  : body
	};

	return this.push(deviceParams, pushParameters);
};

/**
 * Push a link to a device.
 *
 * @param   {String}  deviceParams Push device parameters. See push().
 * @param   {String}  title        Name of address.
 * @param   {String}  url          URL to push.
 * @param   {String}  body         A message associated with the link.
 * @returns {Promise}
 */
PushBullet.prototype.link = async function link(deviceParams, title, url, body) {
	return this.push(deviceParams, {
		type  : 'link',
		title : title,
		url   : url,
		body  : body
	});
};

/**
 * Push a file to a device.
 *
 * @param   {String}  deviceParams Push device parameters. See push().
 * @param   {String}  filePath     Path to file.
 * @param   {String}  body         A message to go with the file.
 * @returns {Promise}
 */
PushBullet.prototype.file = async function file(deviceParams, filePath, body) {
	const fileName = path.basename(filePath);
	const fileType = mime.getType(filePath);

	const uploadRequestResponse = await fetch(PushBullet.UPLOAD_END_POINT, {
		method : 'post',
		body   : JSON.stringify({
			file_name : fileName,
			file_type : fileType
		}),
		headers : {
			'Content-Type' : 'application/json',
			'Access-Token' : this.apiKey
		}
	});

	const uploadRequestResponseJson = await uploadRequestResponse.json();

	const formData = new FormData();
	formData.append('file', fs.createReadStream(filePath));

	const uploadFileResponse = await fetch(uploadRequestResponseJson.upload_url, {
		method : 'post',
		body   : formData
	});

	if (uploadFileResponse.status !== 204) {
		throw new Error('file upload error');
	}

	return this.push(deviceParams, {
		type      : 'file',
		file_name : fileName,
		file_type : fileType,
		file_url  : uploadRequestResponseJson.file_url,
		body      : body
	});
};

/**
 * Push 'something' to a device.
 *
 * @param   {Mixed}   deviceParams Device parameters.
 * @param   {Object}  bullet       Request parameters as described on https://docs.pushbullet.com/#create-push
 * @returns {Promise}
 */
PushBullet.prototype.push = async function push(deviceParams, bullet) {
	// If deviceParams is a string it could be a contact email or device iden.
	if (typeof deviceParams === 'string') {
		if (deviceParams.indexOf('@') !== -1) {
			bullet.email = deviceParams;
		}
		else {
			bullet.device_iden = deviceParams;
		}
	}
	// If it's a number it's an old style device id.
	else if (typeof deviceParams === 'number') {
		bullet.device_id = deviceParams;
	}
	// If it's an object assume it defines a property of
	// - device_id
	// - device_iden
	// - email
	// - channel_tag
	// - client_iden
	// and optionally source_device_iden
	else if (typeof deviceParams === 'object') {
		for (let param in deviceParams) {
			bullet[param] = deviceParams[param];
		}
	}

	return this.makeRequest('post', PushBullet.PUSH_END_POINT, { json : bullet });
};

/**
 * Get the push history.
 *
 * The `options` parameter can use three attributes `cursor`, `limit`
 * and `modified_after` to control the data returned.
 *
 * - `active` is used to only select undeleted pushes.
 * - `cursor` is used to select the page if the results have been paginated.
 * - `limit` is used to limit the number of objects in the reponse.
 * - `modified_after` should be a timestamp.
 *
 * @param   {Object}  options Optional options object.
 * @returns {Promise}
 */
PushBullet.prototype.history = async function history(options) {
	options = options ? options : {};

	if (options.active === undefined) {
		options.active = true;
	}

	if (options.modified_after === undefined) {
		options.modified_after = 0;
	}

	return this.getList(PushBullet.PUSH_END_POINT, options);
};

/**
 * Dismiss a push.
 *
 * @param   {String}  pushIden Push IDEN of the push to update.
 * @param   {Object}  updates  Updates to make to push.
 * @returns {Promise}
 */
PushBullet.prototype.dismissPush = async function dismissPush(pushIden) {
	return this.updatePush(pushIden, { dismissed : true });
};

/**
 * Update a push.
 *
 * @param   {String}  pushIden Push IDEN of the push to update.
 * @param   {Object}  updates  Updates to make to push.
 * @returns {Promise}
 */
PushBullet.prototype.updatePush = async function updatePush(pushIden, updates) {
	updates = updates ? updates : {};

	const options = {
		json : updates
	};

	return this.makeRequest('post', PushBullet.PUSH_END_POINT + '/' + pushIden, options);
};

/**
 * Delete a push.
 *
 * @param   {String}  pushIden Push IDEN of the push to delete.
 * @returns {Promise}
 */
PushBullet.prototype.deletePush = async function deletePush(pushIden) {
	return this.makeRequest('delete', PushBullet.PUSH_END_POINT + '/' + pushIden, null);
};

/**
 * Delete all pushes belonging to the current user.
 *
 * @returns {Promise}
 */
PushBullet.prototype.deleteAllPushes = async function deleteAllPushes() {
	return this.makeRequest('delete', PushBullet.PUSH_END_POINT, {});
};
