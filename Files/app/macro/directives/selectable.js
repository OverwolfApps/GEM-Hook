(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('selectable', selectable);

	function selectable($parse) {
		return function(scope, element, attrs) {
			var fn = $parse(attrs.selectable);

			element.selectable({
				filter: '.keyboard-key',
				stop: function(event, ui) {
					var elementArr = [];

					$('.ui-selected', this).each(function() {
						elementArr.push(this);
					});

					fn(scope, { $keys: elementArr });
				}
			});
		};
	}

}());
