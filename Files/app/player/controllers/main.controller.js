(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('MainController', MainController);

	function MainController($scope, $interval, $q, messenger) {

		var progressInterval,
			odkWindow,
			mediaPlayerId,
			maximumWidth = screen.width,
			maximumHeight = screen.height,
			width,
			height,
			scale = 0.6,
			progressDiv = document.querySelector('#progress'),
			displayDiv = document.querySelector('#progress-wrapper'),
			content = document.querySelector('#content');


		$scope.volume = 100;
		$scope.speed = 1;
		$scope.isPlaying = false;
		$scope.progress = 0;
		$scope.replayLength = 0;

		$scope.$watch('progress', function(newValue, oldValue) {
			var porcent = ($scope.progress * 100) / $scope.replayLength;
			progressDiv.style.width = parseInt((displayDiv.offsetWidth / 100) * porcent) + 'px';
		});

		$scope.$on('message-received', function(event, message) {
			if (message.id !== 'videoURL') return;
			var url = JSON.parse(message.content).url;
			setVideo(url)
				.then(function() {
					$scope.toggleState(true);
				});
		});

		$scope.progressClicked = function(event) {
			var percent = (event.offsetX * 100) / displayDiv.offsetWidth;
			$scope.progress = parseInt(($scope.replayLength * percent) / 100);
			$scope.progressChanged();
		};

		$scope.closeWindow = function() {
			overwolf.windows.close(odkWindow.id, function() {});
		};

		$scope.toggleState = function(state) {

			var play = function() {
				overwolf.windows.mediaPlayerElement.play(mediaPlayerId, function(result) { console.log('mediaPlayer play result', result); });
			};
			var pause = function() {
				overwolf.windows.mediaPlayerElement.pause(mediaPlayerId, function(result) { console.log('mediaPlayer pause result', result); });
			};

			if (typeof state !== 'undefined') {
				if (state) play();
				else pause();
			} else {
				if ($scope.isPlaying) pause();
				else play();
			}
		};

		$scope.toggleMute = function() {
			if ($scope.volume === 0) {
				overwolf.windows.mediaPlayerElement.setVolume(mediaPlayerId, 100, function() {});
				$scope.volume = 100;
			} else {
				overwolf.windows.mediaPlayerElement.setVolume(mediaPlayerId, 0, function() {});
				$scope.volume = 0;
			}
		};

		$scope.volumeChanged = function() {
			overwolf.windows.mediaPlayerElement.setVolume(mediaPlayerId, parseInt($scope.volume), function() {});
		};

		$scope.speedChanged = function() {
			overwolf.windows.mediaPlayerElement.setPlaybackSpeed(mediaPlayerId, parseFloat($scope.speed), function() {});
		};

		$scope.progressChanged = function() {
			overwolf.windows.mediaPlayerElement.seek(mediaPlayerId, parseInt($scope.progress), function() {});
		};

		$scope.contentClicked = function(event) {
			if (event.srcElement === document.querySelector('#content')) $scope.toggleState();
		};

		$scope.checkESC = function(event) {
			switch (event.keyCode) {
				case 27:
					overwolf.windows.close('playerWindow');
					break;
				case 32:
					$scope.toggleState();
					break;
			}
		};

		function startInterval() {
			progressInterval = $interval(updateProgress, 1000);
		}

		function stopInterval() {
			if (progressInterval) $interval.cancel(progressInterval);
			progressInterval = undefined;

		}

		function updateProgress() {
			overwolf.windows.mediaPlayerElement.getProgress(mediaPlayerId, function(result) {
				if (result.status === 'success') {
					$scope.progress = result.progress;
					$scope.$digest();
				}
			});
		}

		function getWindow() {
			return $q(function(resolve, reject) {
				overwolf.windows.getCurrentWindow(function(result) {
					if (result.status === 'success') {
						odkWindow = result.window;
						resolve();
					} else reject(result.error);
				});
			});
		}

		function getRunningGameInfo() {
			return $q(function(resolve, reject) {
				overwolf.games.getRunningGameInfo(function(gameInfo) {
					if (gameInfo) {
						maximumWidth = gameInfo.width;
						maximumHeight = gameInfo.height;
					}
					resolve();
				});
			});
		}

		function setWindowSize() {
			width = parseInt(maximumWidth * scale);
			height = parseInt(maximumHeight * scale);

			return $q(function(resolve, reject) {
				overwolf.windows.changeSize(odkWindow.id, width, height, function(result) {
					if (result.status === 'success') resolve();
					else reject(result.error);
				});
			});
		}

		function centerWindow() {
			var top = parseInt(maximumWidth / 2 - width / 2);
			var left = parseInt(maximumHeight / 2 - height / 2);

			return $q(function(resolve, reject) {
				overwolf.windows.changePosition(odkWindow.id, top, left, function(result) {
					if (result.status === 'success') resolve();
					else reject(result.error);
				});
			});
		}

		function createPlayer() {
			return $q(function(resolve, reject) {
				overwolf.windows.mediaPlayerElement.create(content.offsetLeft, content.offsetTop , content.offsetWidth, content.offsetHeight, function(result) {
					if (result.status === 'success') {
						mediaPlayerId = result.id || 1;
						resolve();
					} else reject(result.error);
				});
			});
		}

		function setVideo(url) {
			return $q(function(resolve, reject) {

				$scope.toggleState(false);

				overwolf.windows.mediaPlayerElement.setVideo(url, function(result) {
					console.log('mediaPlayer setVideo result', result);
					if (result.status === 'success') {
						$scope.replayLength = result.duration || result.length;
						$scope.progress = 0;
						$scope.$digest();
						resolve();
					} else reject(result.error);
				});
			});
		}

		function playbackStarted() {
			startInterval();
			$scope.isPlaying = true;
			$scope.$digest();
		}

		function playbackPaused() {
			stopInterval();
			$scope.isPlaying = false;
			$scope.$digest();
		}

		function playbackStopped() {
			stopInterval();
			$scope.isPlaying = false;
			$scope.$digest();
		}

		function playbackEnded() {
			stopInterval();
			$scope.isPlaying = false;
			$scope.progress = 0;
			$scope.$digest();
		}

		function playbackError(result) {
			$scope.isPlaying = false;
			$scope.$digest();
			console.error('Playback error.', result);
			alert('Playback error. Message: ' + result.error);
		}

		overwolf.windows.mediaPlayerElement.onPlaybackStarted.addListener(playbackStarted);
		overwolf.windows.mediaPlayerElement.onPlaybackPaused.addListener(playbackPaused);
		overwolf.windows.mediaPlayerElement.onPlaybackStopped.addListener(playbackStopped);
		overwolf.windows.mediaPlayerElement.onPlaybackEnded.addListener(playbackEnded);
		overwolf.windows.mediaPlayerElement.onPlaybackError.addListener(playbackError);

		getWindow()
			.then(getRunningGameInfo)
			.then(setWindowSize)
			.then(centerWindow)
			.then(createPlayer)
			.catch(function(error) {
				alert(error);
			});
	}

}());