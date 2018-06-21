angular
	.module('gemApp')
	.directive('toggle', function() {
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
					<i class="fa fa-fw no-shrink" style="margin-right: 5px" ng-class="checked ? \'fa-toggle-on\' : \'fa-toggle-off\'"></i>\
					<div class="grow">\
						<h6 class="grow" ng-bind="label"></h6>\
						<ng-transclude class="column" ng-if="hasTransclude"></ng-transclude>\
					</div>\
				</div>',
			link: function(scope, element, attrs, m, $transclude) {
				$transclude(function(transcludeElement, transcludeScope) {
					scope.hasTransclude = !!transcludeElement.length;
				});
			}
		};
	});