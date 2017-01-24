(function() {
	'use strict';

	angular
		.module('gemApp', ['ngStorage'])
		.config(config);

	function config($compileProvider) {
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|overwolf-fs|overwolf-extension):/);
	}

}());