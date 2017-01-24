(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('ReplaysController', ReplaysController);

	function ReplaysController($scope, replayFiles, cerebro) {

		$scope.replayFiles = replayFiles;

		$scope.playReplay = function(replay) {
			cerebro.openReplay(replay.url);
		};

		$scope.exploreReplay = function(replay) {
			overwolf.utils.openWindowsExplorer(replay.url, function(result) {
				console.log('openWindowsExplorer result', result);
			});
		};

		$scope.deleteReplay = function(replay) {
			var confirmResult = confirm('Are you sure?');
			if (confirmResult) {
				q(overwolf.media.videos.deleteVideo, replay.url)
					.then(function() {
						$scope.$apply(function() {
							$scope.replayFiles.splice($scope.replayFiles.indexOf(replay), 1);
						});
					});
			}
		};
	}

}());