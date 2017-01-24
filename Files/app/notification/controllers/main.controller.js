(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('MainController', MainController);

	function MainController($scope, $localStorage, $timeout, messenger) {

		var notificationsHandlers = [];

		$scope.images = [];
		$scope.preloadImages = [];
		$scope.calibrateImage = {};

		$scope.$on('message-received', messageReceived);

		$scope.imagePreloaded = function(image) {
			console.log('Image preloaded successfully', image);
			messenger.send('mainWindow', 'imagePreloaded', image);
			$scope.preloadImages.splice($scope.preloadImages.indexOf(image), 1);
		};

		$scope.imageError = function(image) {
			console.log('Error preloading image', image);
			$scope.preloadImages.splice($scope.preloadImages.indexOf(image), 1);
		};

		$scope.calibrateImageLoaded = function() {
			$scope.calibrateImage.loaded = true;
		};

		function messageReceived(event, message) {
			switch (message.id) {
				case 'showNotification':
					var notification = JSON.parse(message.content);
					var base = {
						layout: 'topRight',
						theme: 'custom',
						text: '',
						maxVisible: 0,
						animation: {
							open: 'animated fadeInRight',
							close: 'animated fadeOutDown'
						},
						timeout: '5000'
					};
					angular.extend(base, notification);
					if (base.mode === 'sticky') {
						var not = notificationsHandlers[notification.id];
						if (not && !not.wasClicked) not.setText(notification.text);
						else {
							delete base.timeout;
							notificationsHandlers[notification.id] = noty(base);
						}
					} else {
						noty(base);
					}
					break;
				case 'showImage':
					var image = JSON.parse(message.content);
					$scope.images.push(image);
					$scope.$digest();
					$timeout(function() {
						$scope.images.splice($scope.images.indexOf(image), 1);
					}, image.timeout * 1000);
					break;
				case 'preloadImage':
					var image = JSON.parse(message.content);
					$scope.preloadImages.push(image);
					$scope.$digest();
					break;
				case 'calibrateImage':
					$scope.calibrateImage = {};
					$scope.$digest();
					$scope.calibrateImage.url = JSON.parse(message.content).url;
					$scope.$digest();
					break;
				case 'calibrateImageEnd':
					$scope.calibrateImage = {};
					$scope.$digest();
					break;
				case 'updateCaptureNotifications':
					setWindowStreamingMode();
					break;
				default:
					console.warn('Unmanaged message', message);
			}
		}

		function maximize() {
			q(overwolf.windows.getCurrentWindow)
				.then(function(result) {
					overwolf.windows.maximize(result.window.id, function(result) {
						console.log('maximize result', result);
					});
				});
		}

		function setWindowStreamingMode() {
			q(overwolf.windows.getCurrentWindow)
				.then(function(result) {
					var mode = $localStorage.settings.captureNotifications ? 'Always' : 'Never';
					console.log('Setting window streaming mode to', mode);
					overwolf.streaming.setWindowStreamingMode(result.window.id, mode, function(result) {
						console.log('setWindowStreamingMode result', result);
					});
				});
		}

		overwolf.games.onGameInfoUpdated.addListener(maximize);

		maximize();
		setWindowStreamingMode();
	}

}());