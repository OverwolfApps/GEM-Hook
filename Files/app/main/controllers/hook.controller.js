(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('HookController', HookController);

	function HookController($scope, $routeParams, $location, $localStorage, events, animations, messenger) {

		$scope.$storage = $localStorage;
		$scope.events = events.data;
		$scope.animations = animations.data;

		$scope.infos = {
			keystrokes: '-[CAUTION]-\nKeep in mind that holding any modifier key while performing this action will change the output completely.\n\nExamples:\nA F1 1 SPACE ENTER ALT+Q\n\nTo sent more than one keystroke you need to add a space between them, as it is shown in the example. Every keystroke is sent 1 ms after the other, to apply a delay between them use keystroke@ms. eg:\nA@200 ALT+Q\nALT+Q will be sent 200 ms after A.'
		};

		$scope.hook = {
			id: makeID(),
			enabled: true,
			conditions: [],
			screenshot: {
				notify: true
			},
			replay: {
				pastDuration: -15,
				futureDuration: 5,
				notify: true,
				autoplay: false
			},
			audio: {
				url: 'http://',
			},
			image: {
				url: 'http://',
				top: 0,
				left: 0,
				width: 0,
				height: 0,
				timeout: 5
			},
			notification: {
				text: '',
				mode: 'normal',
				type: 'alert',
				layout: 'topRight',
				openAnimation: 'fadeIn',
				closeAnimation: 'fadeOutDown',
				timeout: 5
			},
			openURL: {
				url: 'http://'
			},
			keyboard: {
				effect: 'Fixed',
				color: 'rgb(255, 0, 0)',
				interval: '150',
				duration: 2
			},
			macro: {}
		};

		$scope.playAudio = function() {
			overwolf.media.audio.create($scope.hook.audio.url, function(result) {
				if (result.status === 'success' || result.id) overwolf.media.audio.play(result.id, function() {});
			});
		};

		$scope.stopAudio = function() {
			overwolf.media.audio.stop(function() {});
		};

		$scope.variableClicked = function(key) {
			if (typeof $scope.hook.notification.text === 'undefined') $scope.hook.notification.text = '';
			$scope.hook.notification.text += '{{' + key.name + '}}';
		};

		$scope.openMacros = function() {
			q(overwolf.windows.obtainDeclaredWindow, 'macroWindow')
				.then(function(result) {
					overwolf.windows.restore(result.window.id, function() {});
				});
		};

		$scope.calibrateImage = function() {
			messenger.send('notificationWindow', 'calibrateImage', $scope.hook.image);
		};

		$scope.testNotification = function() {
			messenger.send('notificationWindow', 'showNotification', {
				id: $scope.hook.id,
				mode: $scope.hook.notification.mode,
				layout: $scope.hook.notification.layout,
				text: $scope.hook.notification.text,
				type: $scope.hook.notification.type,
				animation: {
					open: 'animated ' + $scope.hook.notification.openAnimation,
					close: 'animated ' + $scope.hook.notification.closeAnimation
				},
				timeout: ($scope.hook.notification.timeout * 1000).toString()
			});
		};

		$scope.save = function() {
			if ($routeParams.index) $localStorage.hooks[$routeParams.index] = angular.copy($scope.hook);
			else $localStorage.hooks.push($scope.hook);

			$localStorage.$apply();

			$location.path('/');
		};

		function makeID() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 5; i++) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			return text;
		}

		function messageReceived(event, message) {
			switch (message.id) {
				case 'imagePosition':
				case 'imageSize':
					angular.extend($scope.hook.image, JSON.parse(message.content));
					$scope.$digest();
					break;
			}
		}

		$scope.$on('$routeChangeStart', function() {
			messenger.send('notificationWindow', 'calibrateImageEnd');
		});
		$scope.$on('message-received', messageReceived);

		if ($routeParams.index) {
			$scope.hook = angular.copy($localStorage.hooks[$routeParams.index]);
		}

	}

}());