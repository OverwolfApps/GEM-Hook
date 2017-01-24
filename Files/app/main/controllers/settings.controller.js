(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('SettingsController', SettingsController);

	function SettingsController($scope, $location, $localStorage, notificationCaptureState, replayCaptureState, instantReplayHotkey, cerebro, messenger) {

		$scope.settings = angular.copy($localStorage.settings);
		$scope.settings.captureNotifications = notificationCaptureState;

		$scope.replayCaptureState = replayCaptureState;
		$scope.instantReplayHotkey = instantReplayHotkey;

		$scope.toggleReplayCapture = function() {
			cerebro.toggleCapture()
				.then(function(state) {
					if (state !== undefined) $scope.replayCaptureState = state;
				});
		};

		$scope.save = function() {
			$localStorage.settings = $scope.settings;
			$localStorage.$apply();

			messenger.send('notificationWindow', 'updateCaptureNotifications');

			q(overwolf.windows.obtainDeclaredWindow, 'inputWindow')
				.then(function(result) {
					if (!$scope.settings.captureInputs && result.window.isVisible) {
						console.log('Closing inputWindow');
						overwolf.windows.close('inputWindow', function(result) {
							console.log('close inputWindow result', result);
						});
					} else if ($scope.settings.captureInputs && !result.window.isVisible) {
						console.log('restoring inputWindow');
						overwolf.windows.restore(result.window.id, function(result) {
							console.log('restore inputWindow result', result);
						});
					}
				});

			$location.path('/');
		};

	}

}());