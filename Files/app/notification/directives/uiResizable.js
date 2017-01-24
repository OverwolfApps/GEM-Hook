(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('uiResizable', uiResizable);

	function uiResizable(messenger) {
		return function(scope, element, attrs) {
			element.resizable({
				aspectRatio: true,
				handles: 'ne, se, sw, nw',
				stop: function(event, data) {
					messenger.send('mainWindow', 'imagePosition', data.position);
					messenger.send('mainWindow', 'imageSize', data.size);
				}
			});
		};
	}

}());
