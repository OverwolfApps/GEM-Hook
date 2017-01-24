(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('toggle', toggle);

	function toggle() {
		return {
			restrict: 'E',
			scope: {
				label: '@',
				checked: '='
			},
			replace: true,
			transclude: true,
			template:
				'<div class="row toggle">\
					<div class="grow">\
						<h4 class="grow" ng-bind="label"></h4>\
						<ng-transclude class="column" style="margin-top: 2px" ng-if="hasTransclude"></ng-transclude>\
					</div>\
					<i class="fa fa-fw no-shrink" ng-class="checked ? \'fa-toggle-on\' : \'fa-toggle-off\'"></i>\
				</div>',
			link: function(scope, element, attrs, m, $transclude) {
				$transclude(function(transcludeElement, transcludeScope) {
					scope.hasTransclude = !!transcludeElement.length;
				});
			}
		};
	}

}());