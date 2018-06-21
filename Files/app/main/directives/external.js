angular
	.module('gemApp')
	.directive('external', function() {
		return {
			restrict: 'E',
			scope: {
				label: '@',
				href: '@'
			},
			replace: true,
			transclude: true,
			template:
				'<div class="row external" ng-click="click()">\
					<i class="fa fa-external-link fa-fw" style="margin-right: 5px"></i>\
					<div class="grow">\
						<h6 class="grow" ng-bind="label"></h6>\
						<ng-transclude class="column"></ng-transclude>\
					</div>\
				</div>',
			link: function(scope, element, attrs) {
				scope.click = function() {
					if (element.is('[disabled]')) return;
					location.href = scope.href;
				};
			}
		};
	});
