(function(window, overwolf) {
	'use strict';
	if (!overwolf) return;

	window.q = function(f) {
		if (typeof f !== 'function') throw new TypeError('First argument must be a function.');
		var args = [];
		Array.prototype.push.apply(args, arguments);
		args.shift();
		return new Promise(function(resolve, reject) {
			args.push(function(result) {
				if (result.status === 'success') resolve(result);
				else reject(result);
			});
			f.apply(overwolf, args);
		});
	};
})(window, window.overwolf);