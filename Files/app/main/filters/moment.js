angular
	.module('gemApp')
	.filter('moment', function() {
		return function(value) {
			return moment(value).fromNow();
		};
	});