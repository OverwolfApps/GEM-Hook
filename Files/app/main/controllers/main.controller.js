(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('MainController', MainController);

	function MainController($scope, $location, $localStorage, cerebro) {

		$scope.$storage = $localStorage;

		$scope.newHook = function () {
			$location.path('/hook');
		};

		$scope.editHook = function(index) {
			$location.path('/hook/' + index);
		};

		$scope.deleteHook = function(index) {
			$localStorage.hooks.splice(index, 1);
			cerebro.updateRequiredFeatures();
			cerebro.checkForTheOptimalCaptureBufferLength();
		};

		$scope.showLog = function() {
			$location.path('/log');
		};

		$scope.showSettings = function() {
			$location.path('/settings');
		};

		$scope.showReplays = function() {
			$location.path('/replays');
		};

		cerebro.updateRequiredFeatures();
		cerebro.preloadResources();
		cerebro.checkForTheOptimalCaptureBufferLength();
	}

}());