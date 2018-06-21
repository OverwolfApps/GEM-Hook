angular
	.module('gemApp')
	.directive('checkbox', function() {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				label: '@'
			},
			replace: true,
			transclude: true,
			template:
				'<div class="row checkbox" ng-class="{\'checkbox-active\': checked}" ng-click="click()">\
					<i class="fa fa-fw no-shrink" style="margin-right: 5px" ng-class="checked ? \'fa-check-square-o\' : \'fa-square-o\'"></i>\
					<div class="grow" ng-if="label">\
						<h6 class="grow" ng-bind="label"></h6>\
						<ng-transclude class="column" ng-if="hasTransclude"></ng-transclude>\
					</div>\
				</div>',
			link: function(scope, element, attrs, ngModel, $transclude) {

				$transclude(function(transcludeElement, transcludeScope) {
					scope.hasTransclude = !!transcludeElement.length;
				});

				scope.click = function() {
					if (element.is('[disabled]')) return;
					scope.checked = !(!!ngModel.$viewValue);
					ngModel.$setViewValue(scope.checked);
				};

				ngModel.$render = function() {
					scope.checked = !!ngModel.$viewValue;
				};

			}
		};
	});