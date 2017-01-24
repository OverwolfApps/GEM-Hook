(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('group', group);

	function group() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				label: '@'
			},
			transclude: true,
			template:
				'<div class="form-group">\
					<div class="row" ng-click="toggleVisible()">\
						<h4 class="grow" ng-bind="label"></h4>\
						<i class="fa fa-fw" ng-class="visible ? \'fa-minus\' : \'fa-plus\'"></i>\
					</div>\
					<ng-transclude class="column" style="margin-top: 2px" ng-show="visible"></ng-transclude>\
				</div>',
			link: function(scope, element, attrs) {
				scope.visible = attrs.visible ? scope.$eval(attrs.visible) : false;

				scope.toggleVisible = function() {
					scope.visible = !scope.visible;
				};
			}
		};
	}

}());