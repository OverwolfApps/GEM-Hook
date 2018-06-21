angular
	.module('gemApp')
	.controller('HookCtrl', function($scope, $routeParams, $location, $localStorage, events, animations, Messenger) {

		$scope.$storage = $localStorage;
		$scope.events = events.data;
		$scope.animations = animations.data;

		$scope.hook = {
			id: makeID($localStorage.hooks),
			enabled: true,
			conditions: [],
			screenshot: {
				notify: true
			},
			replay: {
				range: {
					pastDuration: -15,
					futureDuration: 5,
				},
				notify: true,
				autoplay: false
			},
			audio: {
				url: 'http://'
			},
			image: {
				url: 'http://',
				top: 0,
				left: 0,
				width: 0,
				height: 0,
				openAnimation: 'fadeIn',
				closeAnimation: 'fadeOutDown',
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

		if ($routeParams.index) $scope.hook = angular.copy($localStorage.hooks[$routeParams.index]);

		$scope.playAudio = function() {
			overwolf.media.audio.create($scope.hook.audio.url, function(result) {
				if (result.status === 'success' || result.id) overwolf.media.audio.play(result.id, function() {});
				else alert(result.error);
			});
		};

		$scope.stopAudio = function() {
			overwolf.media.audio.stop(function() {});
		};

		$scope.variableClicked = function(key) {
			var position = document.getElementById('notificationText').selectionStart;

			if (typeof $scope.hook.notification.text === 'undefined') $scope.hook.notification.text = '';
			$scope.hook.notification.text = $scope.hook.notification.text.substr(0, position) + '{{' + key.name + '}}' + $scope.hook.notification.text.substr(position);
		};

		$scope.testNotification = function() {
			Messenger.send('NotificationWindow', 'showNotification', {
				id: $scope.hook.id,
				mode: $scope.hook.notification.mode,
				text: $scope.hook.notification.text,
				type: $scope.hook.notification.type,
				animation: {
					open: 'animated ' + $scope.hook.notification.openAnimation,
					close: 'animated ' + $scope.hook.notification.closeAnimation
				},
				timeout: $scope.hook.notification.timeout * 1000
			});
		};

		$scope.openMacros = function() {
			q(overwolf.windows.obtainDeclaredWindow, 'MacroWindow')
				.then(function(result) {
					overwolf.windows.restore(result.window.id, function() {});
				});
		};

		$scope.save = function() {
			if ($routeParams.index) $localStorage.hooks[$routeParams.index] = angular.copy($scope.hook);
			else $localStorage.hooks.push($scope.hook);

			$localStorage.$apply();

			$location.path('/');
		};

		function makeID(arrayToCompare) {
			var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var id;

			do {
				id = '';
				for (var i = 0; i < 5; i++) {
					id += possible.charAt(Math.floor(Math.random() * possible.length));
				}
			} while (!arrayToCompare.every(obj => obj.id !== id));

			return id;
		}

	});