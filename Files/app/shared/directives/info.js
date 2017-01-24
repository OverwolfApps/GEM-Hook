(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('info', info);

	function info() {
		return {
			restrict: 'E',
			scope: {
				text: '='
			},
			replace: true,
			template: '<i class="fa fa-question-circle fa-fw" ng-click="alert()"></i>',
			link: function(scope, element, attrs) {
				scope.alert = function() {
					alert(scope.text);
				};
			}
		};
	}

}());