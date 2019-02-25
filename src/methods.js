var endianness = require("endianness");

var methods = {

	getInfo: {
		key: 1,
		params: [
			{ name: 'token', length: 32 }
		]
	},

	getCounters: {
		key: 5,
		params: [],
		parse: (data) => {
			var blocks, transactions;

			[blocks, transactions] = [data.slice(0, 8), data.slice(8, 16)].map(item => {
				endianness(item, 8);
				return parseInt(item.toString('hex'), 16)
			})

			return { blocks, transactions }
		}
	},

	getBlocks: {
		key: 9,
		params: [
			{ name: 'offset', length: 8, type: Number, default: 0 },
			{ name: 'limit', length: 2, type: Number },
		],
		parse: (data) => {
			var result = [];
			for (var i = 0; i < data.length; i = i + 64) {
				if (data.length - i >= 64) {
					result.push(data.slice(i, i + 64).toString('hex').toUpperCase())
				}
			}

			return Promise.all(result.map(item => {
				return makeRequest('getBlockSize', { block: item });
			}))
		}
	},

	getBlockSize: {
		key: 11,
		params: [
			{ name: 'block', length: 64 }
		],
		parse: (data) => {
			var block = data.slice(0, 64).toString('hex'),
				transactionsCount = data.slice(64, 72);

			endianness(transactionsCount, 8);

			return { block: block.toString('hex').toUpperCase(), transactionsCount: parseInt(transactionsCount.toString('hex'), 16) };
		}
	},

	getTransactions: {
		key: 13,
		params: [
			{ name: 'block', length: 64, type: String },
			{ name: 'offset', length: 8, type: Number },
			{ name: 'limit', length: 2, type: Number },
		],
		parse: (data, params) => {
			data = data.slice(64);

			var result = [];
			for (var i = 0; i < data.length; i = i + 64) {
				var signature =  data.slice(i, i + 64);
				if (data.length - i >= 64) {
					result.push(signature.toString('hex').toUpperCase())
				}
			}

			return Promise.all(result.map(item => {
				return makeRequest('getTransaction', { block: params.block, signature: item })
			})).then(transactionsInfo => 
				result.map((item, index) => {
					return { signature: item, cost: transactionsInfo[index].cost }
				})
			)
		}
	},

	getTransaction: {
		key: 15,
		params: [
			{ name: 'block', length: 64 },
			{ name: 'signature', length: 64 },
		],
		parse: (data) => {
			data = data.slice(128);

			var from = data.slice(0, 32).toString('hex').toUpperCase(),
				to = data.slice(32, 64).toString('hex').toUpperCase(),
				cost1 = data.slice(64, 68),
				cost2 = data.slice(68, 76),
				currency = data.slice(76, 92).toString().replace(/\0/g, '');

			endianness(cost1, 4);
			endianness(cost2, 8);
			var c_int = parseInt(cost2.toString('hex'), 16);
			var c = ('000000000' + c_int).substr(c_int.toString().length);

			return { from, to, cost: `${parseInt(cost1.toString('hex'), 16)}.${c} ${currency}` }
		}
	}
}

function hexToDec(s) {
    var result = [];
    for (var i = 0; i < s.length; i += 2) {
        result.push(parseInt(s.charAt(i) + s.charAt(i + 1), 16));
    }
    return result;
}

module.exports = methods;
