angular
	.module('gemApp')
	.controller('ReplaysCtrl', function($scope, replays, Cerebro) {

		$scope.replays = replays;

		$scope.playReplay = function(replay) {
			Cerebro.openReplay(replay.url);
		};

		$scope.exploreReplay = function(replay) {
			overwolf.utils.openWindowsExplorer(replay.url, function() {});
		};

		$scope.deleteReplay = function(replay) {
			swal({
				title: '',
				text: 'Are you sure?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#a52a2a',
				confirmButtonText: 'Yes, delete it!'
			},
			function() {
				q(overwolf.media.videos.deleteVideo, replay.url)
					.then(function() {
						$scope.replays.splice($scope.replays.indexOf(replay), 1);
						$scope.$digest();
					});
			});
		};

	});