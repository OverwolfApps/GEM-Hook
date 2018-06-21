angular
	.module('gemApp')
	.controller('LogsCtrl', function($scope, $sessionStorage, Messenger) {

		$scope.$storage = $sessionStorage;

		$scope.clearLog = function() {
			$sessionStorage.events = [];
		};

		$scope.placeOnClipboard = function(data) {
			overwolf.utils.placeOnClipboard(data.toString());
			Messenger.send('NotificationWindow', 'showNotification', {
				type: 'info',
				text: data + ' copied to clipboard.'
			});
		};

	});