(function() {
	'use strict';

	angular
		.module('gemApp', ['ngAnimate', 'angular-themer', 'ngStorage', 'color.picker'])
		.config(config);

	function config(themerProvider, $provide) {
		var styles = [
			{ key: 'LOGITECH', label: 'Logitech', href: 'assets/css/themes/logitech.css'},
			{ key: 'ROG', label: 'ROG', href: 'assets/css/themes/rog.css'},
			{ key: 'MARVEL', label: 'Marvel Heroes', href: 'assets/css/themes/marvel.css'},
			{ key: 'SMITE', label: 'SMITE', href: 'assets/css/themes/smite.css'},
			{ key: 'WARFACE', label: 'Warface', href: 'assets/css/themes/warface.css'},
			{ key: 'ROBOCRAFT', label: 'Robocraft', href: 'assets/css/themes/robocraft.css'},
			{ key: 'CSGO', label: 'CSGO', href: 'assets/css/themes/csgo.css'},
			{ key: 'LOL', label: 'League of Legends', href: 'assets/css/themes/lol.css'},
			{ key: 'DOTA2', label: 'Dota 2', href: 'assets/css/themes/dota2.css'},
			{ key: 'ROCKETLEAGUE', label: 'Rocket League', href: 'assets/css/themes/rocket-league.css'}
		];
		themerProvider.setStyles(styles);
		themerProvider.setSelected(localStorage.getItem('theme') || styles[0].key);

		$provide.decorator('ColorPickerOptions', function($delegate) {
			var options = angular.copy($delegate);
			options.alpha = false;
			options.format = 'rgb';
			options.swatchBootstrap = false;
			return options;
		});
	}

}());