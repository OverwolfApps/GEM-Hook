(function() {
	'use strict';

	if (!window.overwolf) return console.error('q couldn\'t be initialized. reason: overwolf sdk it\'s not present.');
	if (!window.Promise) return console.error('q couldn\'t be initialized. reason: Promises are not supported.');

	window.q = function(f) {
		if (typeof f !== 'function') throw new TypeError('q\'s first argument must be a function.');
		var args = [];
		Array.prototype.push.apply(args, arguments);
		args.shift();
		return new Promise(function(resolve, reject) {
			args.push(function(result) {
				if (result && result.status === 'success') resolve(result);
				else reject(result);
			});
			f.apply(overwolf, args);
		});
	};
}());