angular
	.module('gemApp', ['ngAnimate', 'ngRoute', 'ngMessages', 'ngStorage', 'color.picker'])
	.config(function($compileProvider, $provide, $routeProvider) {

		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|overwolf):/);

		$provide.decorator('ColorPickerOptions', function($delegate) {
			var options = angular.copy($delegate);
			options.alpha = false;
			options.format = 'rgb';
			options.swatchBootstrap = false;
			return options;
		});

		$routeProvider
			.when('/', {
				controller: 'MainCtrl',
				templateUrl: 'app/main/views/main.html',
				resolve: {
					migration: function($localStorage) {
						return new Promise(function(resolve, reject) {

							overwolf.extensions.current.getManifest(function(manifest) {

								var storedVersion = $localStorage.version || '1.0.0';
								var currentVersion = manifest.meta.version;

								if (storedVersion !== currentVersion) {

									var [major, minor, patch] = storedVersion.split('.');

									if (major <= 2) {
										console.log('Old version detected. Trying to migrate hooks.');

										localStorage.removeItem('theme');

										$localStorage.hooks = $localStorage.hooks.filter(function(hook) {
											if (hook.selectedGame.name === 'Marvel Heroes') return false;
											else if (hook.selectedAction === 'show image') return false;

											return true;
										});

										$localStorage.hooks.forEach(function(hook) {
											switch (hook.selectedAction) {
												case 'do nothing':
													hook.selectedAction = 'log event';
													break;
												case 'save replay':
													if (hook.replay.pastDuration != undefined && hook.replay.futureDuration != undefined) {
														hook.replay.range = {
															pastDuration: hook.replay.pastDuration,
															futureDuration: hook.replay.futureDuration
														}
														delete hook.replay.pastDuration;
														delete hook.replay.futureDuration;
													}
													break;
												case 'show notification':
													switch (hook.notification.type) {
														case 'notification':
															hook.notification.type = 'alert';
															break;
														case 'information':
															hook.notification.type = 'info';
															break;
													}
													delete hook.notification.layout;
													break;
											}
										});
									}

									$localStorage.version = currentVersion;
									$localStorage.$apply();
								}
								resolve(true);
							});

						});
					}
				}
			})
			.when('/hook/:index?', {
				controller: 'HookCtrl',
				templateUrl: 'app/main/views/hook.html',
				resolve: {
					events: function($http) {
						return $http.get('data/events.json');
					},
					animations: function($http) {
						return $http.get('data/animations.json');
					}
				}
			})
			.when('/replays', {
				controller: 'ReplaysCtrl',
				templateUrl: 'app/main/views/replays.html',
				resolve: {
					replays: function() {
						return new Promise(function(resolve, reject) {
							overwolf.media.videos.getVideos(function(result) {
								if (result.status === 'success') {
									var replays = result.videos.filter(function(value) {
										return value.match(/\.mp4$/);
									});

									var replayNameRegExp = new RegExp(/(.+)\+(\d+-\d+-\d+\+\d+-\d+-\d+-\d+)$/);

									replays = replays.map(function(replayURL) {
										var result;
										var replayName = replayURL.substring(replayURL.lastIndexOf('/') + 1, replayURL.lastIndexOf('.mp4'));

										if (replayNameRegExp.test(replayName)) {

											var matches = replayNameRegExp.exec(replayName);
											var name = matches[1].replace(/\+/g, ' ');
											var date = moment(matches[2], "MM-DD-YYYY+HH-mm-ss-SSS").toDate();

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
									resolve(replays);
								} else {
									reject(result.error);
								}
							});
						});
					}
				}
			})
			.when('/settings', {
				controller: 'SettingsCtrl',
				templateUrl: 'app/main/views/settings.html',
				resolve: {
					replayCaptureState: function() {
						return new Promise(function(resolve, reject) {
							overwolf.media.replays.getState(function(result) {
								if (result.status === 'success') resolve(result.isOn);
								else reject(result.error);
							});
						});
					},
					notificationCaptureState: function() {
						return new Promise(function(resolve, reject) {
							q(overwolf.windows.obtainDeclaredWindow, 'NotificationWindow')
								.then(function(result) {
									q(overwolf.streaming.getWindowStreamingMode, result.window.id)
										.then(function(result) {
											resolve(result.streaming_mode === 'Always' ? true : false);
										});
								})
								.catch(function(result) {
									reject(result.error);
								});
						});
					},
					toggleGEMHotkey: function() {
						return new Promise(function(resolve, reject) {
							q(overwolf.settings.getHotKey, 'toggle-GEM')
								.then(function(result) {
									resolve(result.hotkey);
								})
								.catch(function(result) {
									reject(result.error);
								});
						});
					},
					toggleCaptureHotkey: function() {
						return new Promise(function(resolve, reject) {
							q(overwolf.settings.getHotKey, 'toggle-capture')
								.then(function(result) {
									resolve(result.hotkey);
								})
								.catch(function(result) {
									reject(result.error);
								});
						});
					},
					instantReplayHotkey: function() {
						return new Promise(function(resolve, reject) {
							q(overwolf.settings.getHotKey, 'instant-replay')
								.then(function(result) {
									resolve(result.hotkey);
								})
								.catch(function(result) {
									reject(result.error);
								});
						});
					}
				}
			})
			.when('/logs', {
				controller: 'LogsCtrl',
				templateUrl: 'app/main/views/logs.html'
			})
			.otherwise({
				redirectTo: '/'
			});

	})
	.run(function($rootScope, $localStorage, $sessionStorage) {

		$rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
			alert('Routing error. Message: ' + rejection);
		});

		$localStorage.$default({
			hooks: [],
			settings: {
				captureOnMinimize: true,
				captureNotifications: true,
				captureInputs: true
			},
			macros: []
		});

		$sessionStorage.$default({
			events: []
		});

		q(overwolf.windows.obtainDeclaredWindow, 'NotificationWindow')
			.then(function(result) {
				overwolf.windows.restore(result.window.id, function() { console.log('Notification window restored.'); });
			});

		if ($localStorage.settings.captureInputs) {
			q(overwolf.windows.obtainDeclaredWindow, 'InputWindow')
				.then(function(result) {
					overwolf.windows.restore(result.window.id, function() { console.log('Input window restored.'); });
				});
		}

	});
