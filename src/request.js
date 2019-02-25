var net = require('net'),
	methods = require('./methods');

function makeRequest(reqType, params) {

	var method = methods[reqType];

	//Object.assign(params, { anyParam: 'test' })

	if (!method)
		return Promise.reject('Method not found');

	var client = new net.Socket();
	//client.setEncoding('hex');

	try {
		var bodyBuffer = makeBody(method, params);
	} catch (err) {
		console.log(err);
		return Promise.reject(err);
	}
	
	return sendRequest(client, bodyBuffer).then(response => {
		response = response.slice(6);

		response = method.parse ? method.parse(response, params) : parseResponse(response);

		return response;
	})
}

function sendRequest(client, bodyBuffer) {
	return new Promise((resolve, reject) => {

		const endBuffer = Buffer.alloc(6);

		client.on('data', (data) => {
			resolve(data);
			client.destroy();
		});

		client.on('error', (err) => {
			reject(err)
		});

		client.connect(38101, '127.0.0.1', function() {
			client.write(bodyBuffer);
			client.write(endBuffer);
		});
	})
}

function parseResponse(data) {
	return data.slice(6);
}

function makeBody(method, params) {

	var offset = 6,
		headLength = 6,
		bodyLength = 0;

	method.params.forEach((item, index) => {
		if (!params[item.name] && typeof(item.default) == "undefined")
			throw 'Incorrect params';

		bodyLength = bodyLength + item.length;
	})

	var buffer = Buffer.alloc(headLength + bodyLength);
	buffer.writeUInt16LE(method.key, 0, 2);
	buffer.writeUInt16LE(bodyLength, 2, 4);

	method.params.forEach((item, index) => {
		var value = typeof(params[item.name]) == "undefined" ? item.default : params[item.name];

		if (item.type == Number)
			buffer.writeUInt16LE(value, offset, item.length);
		else
			buffer.write(value, offset, item.length, 'hex');

		offset += item.length;
	})

	return buffer;
}

module.exports = makeRequest;
