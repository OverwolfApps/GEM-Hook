(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('LogController', LogController);

	function LogController($scope, $sessionStorage, messenger) {
		$scope.$storage = $sessionStorage;

		$scope.clearLog = function() {
			$sessionStorage.events = [];
		};

		$scope.placeOnClipboard = function(data) {
			overwolf.utils.placeOnClipboard(data);
			messenger.send('notificationWindow', 'showNotification', {
				type: 'success',
				text: data + ' copied to clipboard.'
			});
		};
	}

}());