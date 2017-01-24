(function() {
	'use strict';

	angular
		.module('gemApp')
		.filter('moment', Moment);

	function Moment() {
		return function(value) {
			return moment(value).fromNow();
		};
	}

}());