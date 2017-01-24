(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('checkbox', checkbox);

	function checkbox() {
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
					<div class="grow" ng-if="label">\
						<h4 class="grow" ng-bind="label"></h4>\
						<ng-transclude class="column" style="margin-top: 2px" ng-if="hasTransclude"></ng-transclude>\
					</div>\
					<i class="fa fa-fw no-shrink" ng-class="checked ? \'fa-check-square-o\' : \'fa-square-o\'"></i>\
				</div>',
			link: function(scope, element, attrs, ngModelCtrl, $transclude) {

				$transclude(function(transcludeElement, transcludeScope) {
					scope.hasTransclude = !!transcludeElement.length;
				});

				scope.click = function() {
					if (element.is('[disabled]')) return;
					scope.checked = !(!!ngModelCtrl.$viewValue);
					ngModelCtrl.$setViewValue(scope.checked);
				};

				ngModelCtrl.$render = function() {
					scope.checked = !!ngModelCtrl.$viewValue;
				};

			}
		};
	}

}());