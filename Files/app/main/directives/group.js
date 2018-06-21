angular
	.module('gemApp')
	.directive('group', function() {
		return {
			restrict: 'E',
			scope: {
				label: '@'
			},
			replace: true,
			transclude: true,
			template:
				'<div class="form-group">\
					<div class="row" ng-click="toggleVisible()">\
						<h6 class="grow" ng-bind="label"></h6>\
						<i class="fa fa-fw" ng-class="visible ? \'fa-minus\' : \'fa-plus\'"></i>\
					</div>\
					<ng-transclude class="column" ng-show="visible"></ng-transclude>\
				</div>',
			link: function(scope, element, attrs) {
				scope.visible = attrs.visible ? scope.$eval(attrs.visible) : false;

				scope.toggleVisible = function() {
					scope.visible = !scope.visible;
				};
			}
		};
	});

