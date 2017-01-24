(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('external', external);

	function external() {
		return {
			restrict: 'E',
			scope: {
				label: '@',
				href: '@'
			},
			replace: true,
			template:
				'<div class="row external" ng-click="click()">\
					<h4 class="grow" ng-bind="label"></h4>\
					<i class="fa fa-external-link fa-fw"></i>\
				</div>',
			link: function(scope, element, attrs) {

				scope.click = function() {
					if (element.is('[disabled]')) return;
					location.href = scope.href;
				};

			}
		};
	}

}());