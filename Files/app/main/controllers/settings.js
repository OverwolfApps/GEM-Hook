angular
	.module('gemApp')
	.controller('SettingsCtrl', function($scope, $location, $localStorage, notificationCaptureState, replayCaptureState, toggleGEMHotkey, toggleCaptureHotkey, instantReplayHotkey, Cerebro, Messenger) {

		$scope.settings = angular.copy($localStorage.settings);
		$scope.settings.captureNotifications = notificationCaptureState;

		$scope.replayCaptureState = replayCaptureState;
		$scope.toggleGEMHotkey = toggleGEMHotkey;
		$scope.toggleCaptureHotkey = toggleCaptureHotkey;
		$scope.instantReplayHotkey = instantReplayHotkey;

		$scope.toggleReplayCapture = function() {
			Cerebro.toggleCapture()
				.then(function(state) {
					if (state !== undefined) {
						$scope.replayCaptureState = state;
						$scope.$digest();
					}
				});
		};

		$scope.save = function() {
			$localStorage.settings = $scope.settings;
			$localStorage.$apply();

			Messenger.send('NotificationWindow', 'updateCaptureNotifications');

			q(overwolf.windows.obtainDeclaredWindow, 'InputWindow')
				.then(function(result) {

					if ($scope.settings.captureInputs) overwolf.windows.restore(result.window.id, function() { console.log('InputWindow restored.'); });
					else overwolf.windows.close(result.window.id, function() { console.log('InputWindow closed.'); });

					$scope.$apply(function() {
						$location.path('/');
					});
				});
		};

	});
