(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('header', header);

	function header() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				title: '@'
			},
			transclude: true,
			template:
				'<div id="header" class="row no-shrink" ng-mousedown="dragMove()">\
					<h3 class="grow" ng-bind="title"></h3>\
					<i class="fa fa-minus fa-fw" style="position: relative; top: 4px" ng-click="minimize()"></i>\
					<ng-transclude></ng-transclude>\
					<i class="fa fa-times fa-fw" ng-click="close()"></i>\
				</div>',
			link: function(scope, element, attrs) {

				scope.dragMove = function() {
					q(overwolf.windows.getCurrentWindow)
						.then(function(result) {
							overwolf.windows.dragMove(result.window.id, function() {});
						});
				};

				scope.minimize = function() {
					q(overwolf.windows.getCurrentWindow)
						.then(function(result) {
							overwolf.windows.minimize(result.window.id, function() {});
						});
				};

				scope.close = function() {
					q(overwolf.windows.getCurrentWindow)
						.then(function(result) {
							overwolf.windows.close(result.window.id, function() {});
						});
				};

			}
		};
	}

}());