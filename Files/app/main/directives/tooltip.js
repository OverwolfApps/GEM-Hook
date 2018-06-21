angular
	.module('gemApp')
	.directive('tooltip', function($compile) {
		return {
			restrict: 'A',
			scope: {
				tooltip: '='
			},
			link: function (scope, element, attrs) {
				var tip = $compile('<div class="tooltip" ng-show="visible" ng-bind="tooltip"></div>')(scope);

				$('body').append(tip);

				element.on('mouseover', function (event) {
					if (!scope.tooltip) return;
					scope.visible = true;
					scope.$digest();

					var pos = event.target.getBoundingClientRect();
					var offset = tip.offset();
					var tipHeight = tip.outerHeight();
					var tipWidth = tip.outerWidth();
					var elWidth = pos.width || pos.right - pos.left;
					var elHeight = pos.height || pos.bottom - pos.top;
					var tipOffset = 10;

					offset.top = pos.top + elHeight + tipOffset;
					offset.left = pos.left;

					tip.offset(offset);
				});

				element.on('mouseout', function() {
					scope.visible = false;
					scope.$digest();
				});
			}
		};
	});