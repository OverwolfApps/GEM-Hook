(function() {
	'use strict';

	angular
		.module('gemApp')
		.filter('time', time);

	function time() {

		return function(text) {
			var hours = Math.round(text / 3600);
			var minutes = Math.round(text / 60);
			var seconds = Math.round(text % 60);
			var pad = function(number) {
				return number < 10 ? '0' + number : number;
			};

			if (Math.round(hours) === 0) return minutes + ':' + pad(seconds);
			return hours + ':' + pad(minutes) + ':' + pad(seconds);
		};

	}

}());