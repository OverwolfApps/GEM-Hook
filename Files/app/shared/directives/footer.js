(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('footer', footer);

	function footer($location) {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			transclude: true,
			template:
				'<div id="footer" class="row-right no-shrink">\
					<button class="btn back" ng-if="!mainPage" ng-click="back()">Back</button>\
					<ng-transclude></ng-transclude>\
					<img id="resizeButton" src="assets/images/resize-icon.png">\
				</div>',
			link: function(scope, element, attrs) {
				var path = $location.path();
				scope.mainPage = (path === '/' || path === '');

				scope.back = function() {
					$location.path('/');
				};

				element.find('#resizeButton').on('mousedown', function() {
					q(overwolf.windows.getCurrentWindow)
						.then(function(result) {
							overwolf.windows.dragResize(result.window.id, 'BottomRight');
						});
				});
			}
		};
	}

}());