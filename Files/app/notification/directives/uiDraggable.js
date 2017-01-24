(function() {
	'use strict';

	angular
		.module('gemApp')
		.directive('uiDraggable', uiDraggable);

	function uiDraggable(messenger) {
		return function(scope, element, attrs) {
			element.draggable({
				stop: function(event, data) {
					messenger.send('mainWindow', 'imagePosition', data.position);
				}
			});
		};
	}

}());

