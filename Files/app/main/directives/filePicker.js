(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('filePicker', filePicker);

	function filePicker() {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				filter: '@'
			},
			replace: true,
			template: '<i class="btn fa fa-folder fa-fw" ng-click="openFilePicker()"></i>',
			link: function(scope, element, attrs, ngModelController) {
				scope.openFilePicker = function() {
					q(overwolf.utils.openFilePicker, scope.filter)
						.then(function(result) {
							ngModelController.$setViewValue(result.url);
							scope.$apply();
						});
				};
			}
		};
	}

}());