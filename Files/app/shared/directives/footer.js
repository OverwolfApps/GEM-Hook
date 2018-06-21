angular
	.module('gemApp')
	.directive('footer', function($location) {
		return {
			restrict: 'E',
			scope: {},
			replace: true,
			transclude: true,
			template:
				'<div id="footer" class="column column-items-stretch no-shrink">\
					<ng-transclude class="column column-items-stretch"></ng-transclude>\
					<button class="btn" ng-if="!mainPage" ng-click="back()">Back</button>\
				</div>',
			link: function(scope, element, attrs) {
				var path = $location.path();
				scope.mainPage = (path === '/' || path === '');

				scope.back = function() {
					$location.path('/');
				};
			}
		};
	});
