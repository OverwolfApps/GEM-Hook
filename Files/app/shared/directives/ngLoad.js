(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('ngLoad', ngLoad);

	function ngLoad($parse) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var fn = $parse(attrs.ngLoad);
				element.on('load', function(event) {
					scope.$apply(function() {
						fn(scope, { $event: event });
					});
				});
			}
		};
	}

}());