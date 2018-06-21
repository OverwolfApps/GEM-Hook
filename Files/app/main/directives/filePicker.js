angular
	.module('gemApp')
	.directive('filePicker', function() {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				filter: '@'
			},
			replace: true,
			template: '<i class="btn fa fa-folder fa-fw" ng-click="openFilePicker()"></i>',
			link: function(scope, element, attrs, ngModel) {
				scope.openFilePicker = function() {
					overwolf.utils.openFilePicker(scope.filter, function(result) {
						if (result.status === 'success') {
							ngModel.$setViewValue(result.url);
							scope.$apply();
						}
					});
				};
			}
		};
	});