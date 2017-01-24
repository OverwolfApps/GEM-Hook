(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('ngError', ngError);

	function ngError($parse) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var fn = $parse(attrs.ngError);
				element.on('error', function(event) {
					scope.$apply(function() {
						fn(scope, { $event: event });
					});
				});
			}
		};
	}

}());