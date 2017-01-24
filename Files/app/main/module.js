(function() {
	'use strict';

	angular
		.module('gemApp', ['ngAnimate', 'ngRoute', 'angular-themer', 'ngStorage', 'color.picker'])
		.config(config)
		.run(run);

	function config($compileProvider, themerProvider, $provide, $routeProvider) {

		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|overwolf):/);

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

		$routeProvider
			.when('/', {
				controller: 'MainController',
				templateUrl: 'app/main/views/main.html'
			})
			.when('/hook/:index?', {
				controller: 'HookController',
				templateUrl: 'app/main/views/hook.html',
				resolve: {
					events: function($http) {
						return $http.get('events-data.json');
					},
					animations: function($http) {
						return $http.get('animations-data.json');
					}
				}
			})
			.when('/replays', {
				controller: 'ReplaysController',
				templateUrl: 'app/main/views/replays.html',
				resolve: {
					replayFiles: function($q) {
						var defer = $q.defer();
						overwolf.media.videos.getVideos(function(result) {
							if (result.status === 'success') {
								var replays = result.videos.filter(function(value) {
									return value.match(/\.mp4$/);
								});
								replays = replays.map(function(replayURL) {
									var result,
										regexp = /(.+)\+(\d+-\d+-\d+\+\d+-\d+-\d+-\d+)$/,
										replayName = replayURL.substring(replayURL.lastIndexOf('/')+1, replayURL.lastIndexOf('.mp4'));

									if (replayURL && replayName.match(regexp)) {

										var matches = new RegExp(regexp).exec(replayName),
											name = matches[1].replace(/\+/g, ' '),
											date = moment(matches[2], "MM-DD-YYYY+HH-mm-ss-SSS").toDate();

										result = {
											name: name,
											url: replayURL,
											thumbnailUrl: replayURL.replace('videos', 'thumbnails'),
											date: date
										};
									} else {
										result = {
											name: replayName,
											url: replayURL,
											thumbnailUrl: '',
											date: ''
										};
									}
									return result;
								});
								defer.resolve(replays);
							} else defer.reject(result.error);
						});
						return defer.promise;
					}
				}
			})
			.when('/settings', {
				controller: 'SettingsController',
				templateUrl: 'app/main/views/settings.html',
				resolve: {
					replayCaptureState: function($q) {
						return $q(function(resolve, reject) {
							q(overwolf.media.replays.getState)
								.then(function(result) {
									resolve(result.isOn);
								})
								.catch(function() {
									reject();
								});
						});
					},
					notificationCaptureState: function($q) {
						return $q(function(resolve, reject) {
							q(overwolf.windows.obtainDeclaredWindow, 'notificationWindow')
								.then(function(result) {
									q(overwolf.streaming.getWindowStreamingMode, result.window.id)
										.then(function(result) {
											resolve(result.streaming_mode !== 'Always' ? false : true);
										});
								})
								.catch(function() {
									reject();
								});
						});
					},
					instantReplayHotkey: function($q) {
						return $q(function(resolve, reject) {
							q(overwolf.settings.getHotKey, 'instant-replay')
								.then(function(result) {
									resolve(result.hotkey);
								})
								.catch(function() {
									reject();
								});
						});
					}
				}
			})
			.when('/log', {
				controller: 'LogController',
				templateUrl: 'app/main/views/log.html'
			})
			.otherwise({
				redirectTo: '/'
			});
	}

	function run($localStorage, $sessionStorage) {

		var storedVersion = $localStorage.version;

		overwolf.extensions.current.getManifest(function(manifest) {
			var currentVersion = manifest.meta.version;

			if (storedVersion !== currentVersion) {
				console.log('New version installed, cleaning localStorage.');
				$localStorage.$reset({
					version: currentVersion
				});
			}

			$localStorage.$default({
				hooks: [],
				settings: {
					captureOnMinimize: true,
					captureNotifications: false,
					captureInputs: false
				},
				macros: []
			});

			$sessionStorage.$default({
				events: []
			});

			q(overwolf.windows.obtainDeclaredWindow, 'notificationWindow')
				.then(function(result) {
					overwolf.windows.restore(result.window.id, function(result) {
						console.log('notificationWindow restore result', result);
					});
				});

			if ($localStorage.settings.captureInputs) {
				q(overwolf.windows.obtainDeclaredWindow, 'inputWindow')
					.then(function(result) {
						overwolf.windows.restore(result.window.id, function(result) {
							console.log('inputWindow restore result', result);
						});
					});
			}

		});

	}

}());