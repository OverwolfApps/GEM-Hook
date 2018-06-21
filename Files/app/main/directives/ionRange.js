angular
	.module('gemApp')
	.directive('ionRange', function() {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {},
			link: function(scope, element, attrs, ngModel) {
				var opts = {
					type: 'double',
					min: -60,
					max: 60,
					from: -15,
					to: 5,
					from_max: 0,
					to_min: 1,
					force_edges: true,
					postfix: ' seconds',
					decorate_both: false,
					values_separator: ' to '
				};

				element.first().ionRangeSlider(opts);
				var slider = element.first().data('ionRangeSlider');

				scope.$on('$destroy', function() {
					slider.destroy();
				});

				ngModel.$render = function() {
					var values = ngModel.$viewValue.split(';');
					slider.update({
						from: values[0],
						to: values[1]
					});
				};

				ngModel.$parsers.push(function(value) {
					if (value) {
						var values = value.split(';');
						return {
							pastDuration: Number(values[0]),
							futureDuration: Number(values[1])
						};
					}
				});

				ngModel.$formatters.push(function(value) {
					if (value) return `${value.pastDuration};${value.futureDuration}`;
				});
			}
		};
	});