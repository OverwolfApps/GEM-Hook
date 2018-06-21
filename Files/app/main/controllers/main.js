angular
	.module('gemApp')
	.controller('MainCtrl', function($scope, $location, $localStorage, Cerebro) {

		$scope.$storage = $localStorage;

		$scope.newHook = function () {
			$location.path('/hook/');
		};

		$scope.editHook = function(index) {
			$location.path('/hook/' + index);
		};

		$scope.deleteHook = function(index) {
			$localStorage.hooks.splice(index, 1);
			Cerebro.updateRequiredFeatures();
			Cerebro.checkForTheOptimalCaptureBufferLength();
		};

		Cerebro.preloadResources();
		Cerebro.updateRequiredFeatures();
		Cerebro.checkForTheOptimalCaptureBufferLength();

	});