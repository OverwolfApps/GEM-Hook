angular
	.module('gemApp')
	.service('Cerebro', function($rootScope, $localStorage, $sessionStorage, Messenger) {

		var lastRequiredFeatures = [];
		var preloadedResources = [];

		var currentCaptureBufferLength = 20000;
		var suggestedCaptureBufferLength = 20000;

		var isLogitechLedAvailable;

		var processingKeystrokes;
		var processingLighting;

		var lastOpenedReplay;

		var matcher = {
			'is equal to': function(key, data) { return key == data; },
			'is not equal to': function(key, data) { return key != data; },
			'is greater than': function(key, data) { return key > data; },
			'is greater than or equal to': function(key, data) { return key >= data; },
			'is less than': function(key, data) { return key < data; },
			'is less than or equal to': function(key, data) { return key <= data; }
		};

		q(overwolf.logitech.led.init)
			.then(function() {
				console.log('LogitechLed initialized.');
				isLogitechLedAvailable = true;
			})
			.catch(function(result) {
				console.warn('LogitechLed is not available.');
				isLogitechLedAvailable = false;
			});

		q(overwolf.windows.getWindowState, 'MainWindow')
			.then(captureOnMinimize);

		function newInfoUpdateReceived(result) {
			overwolf.games.getRunningGameInfo(function(gameInfo) {

				if (!gameInfo) return;

				var currentGameID = parseInt(gameInfo.id / 10);

				try {
					switch (currentGameID) {
						case 5426: //lol
							switch (result.feature) {
								case 'summoner_info':
									newEventReceived({
											events: [
												{
													name: 'championSelected',
													data: JSON.stringify({ name: result.info.summoner_info.champion })
												}
											]
										});
									break;
								case 'minions':
									if (result.info.game_info.minionKills) {
										newEventReceived({
											events: [
												{
													name: 'minionKill',
													data: JSON.stringify({ count: result.info.game_info.minionKills })
												}
											]
										});
									} else if (result.info.game_info.neutralMinionKills) {
										newEventReceived({
											events: [
												{
													name: 'neutralMinionKill',
													data: JSON.stringify({ count: result.info.game_info.neutralMinionKills })
												}
											]
										});
									}
									break;
								case 'gold':
									newEventReceived({
										events: [
											{
												name: 'goldChanged',
												data: JSON.stringify({ count: result.info.game_info.gold })
											}
										]
									});
									break;
							}
						break;
					}
				} catch (err) {
					console.error('Error creating new event from infoUpdate', err.message);
				}

			});
		}

		function newEventReceived(result) {
			overwolf.games.getRunningGameInfo(function(gameInfo) {

				if (!gameInfo) return;

				var currentGameID = parseInt(gameInfo.id / 10);

				result.events.forEach(function(event) {
					console.log('New event received.', event);

					//Translate some events to an usable condition
					switch (currentGameID) {
						case 8134: //SMITE
							switch (event.name) {
								case 'player death':
								case 'death':
									var pair = event.data.split(',');
									var pname = pair[0].split(':')[1];
									var kname = pair[1].split(':')[1];
									event.data = JSON.stringify({
										playername: pname,
										killername: kname
									});
									break;
							}
							break;
						case 5426: //LOL
							switch (event.name) {
								case 'ability':
								case 'spell':
									event.name = event.name + event.data;
									event.data = '';
									break;
							}
							break;
						case 10844: //Overwatch
							switch (event.name) {
								case 'playerOfTheGame':
								case 'playerLeft':
								case 'localPlayerLeft':
									event.data = JSON.stringify({
										name: event.data
									});
									break;
							}
							break;
					}

					//Try to parse event data
					if (event.data) {
						try {
							event.data = Hjson.parse(event.data);
						} catch (error) {
							console.warn('Hjon parse error.', event.data);
							event.data = '';
						}
					}
					var tmpEvent = angular.copy(event);
					tmpEvent.time = moment().format('LTS');
					$sessionStorage.events.push(tmpEvent);
					var hooks = $localStorage.hooks.filter(function(hook) {
						return ((currentGameID === hook.selectedGame.id) && hook.selectedEvent.name === event.name);
					});
					hooks.forEach(function(hook) {
						if (!hook.enabled) return;

						//Conditions
						if (hook.conditions.length && event.data && Object.keys(event.data).length) {
							var conditionString = '';
							var conditionResult;

							hook.conditions.forEach(function(condition, index, array) {
								if (condition.data && condition.operator && condition.key) {
									var logical = (index === array.length - 1) ? '' : (condition.logical === 'and' ? '&&' : '||');
									var data = (typeof condition.data === 'object') ? condition.data.name : condition.data;
									conditionString += matcher[condition.operator](event.data[condition.key.name], data) + logical;
								}
							});
							try {
								conditionResult = eval(conditionString);
							} catch (error) {
								console.warn('Error evaluating condition.', conditionString);
								conditionResult = false;
							}
							if (!conditionResult) return console.log('Hook condition failed.', conditionString);
							console.log('Hook condition passed.', conditionString);
						}

						//Actions
						switch(hook.selectedAction) {
							case 'log event':
								break;
							case 'play sound':
								if (hook.audio.stopOtherSounds) {
									q(overwolf.media.audio.stop)
										.then(function() {
											playSound(hook.audio.url);
										});
								} else {
									playSound(hook.audio.url);
								}
								break;
							case 'stop sounds':
								q(overwolf.media.audio.stop);
								break;
							case 'take screenshot':
								q(overwolf.media.takeScreenshot)
									.then(function(result) {
										if (hook.screenshot.notify) {
											Messenger.send('NotificationWindow', 'showNotification', {
												type: 'success',
												text: 'Screenshot taken.'
											});
										}
									});
								break;
							case 'save replay':
								overwolf.media.replays.capture(Math.abs(hook.replay.range.pastDuration) * 1000, hook.replay.range.futureDuration * 1000,
									function(result) {
										//finished callback
										if (result.status === 'success') {
											if (hook.replay.notify) {
												Messenger.send('NotificationWindow', 'showNotification', {
													type: 'success',
													text: 'Replay captured.'
												});
											}
											if (hook.replay.autoplay) openReplay(result.url);
										} else {
											notifyError(result);
										}
									},
									function(result) {
										//status callback
										if (result.error) notifyError(result);
									}
								);
								break;
							case 'show notification':
								Messenger.send('NotificationWindow', 'showNotification', {
									id: hook.id,
									mode: hook.notification.mode,
									text: Mustache.render(hook.notification.text, event.data),
									type: hook.notification.type,
									animation: {
										open: 'animated ' + hook.notification.openAnimation,
										close: 'animated ' + hook.notification.closeAnimation
									},
									timeout: hook.notification.timeout * 1000
								});
								break;
							case 'send keystrokes':
								if (processingKeystrokes) return console.log('Hook failed. Only one keystroke hook can be processed at a time.');

								var keystrokes = hook.keystrokes.split(' ');
								var reg = new RegExp(/^(\w+(\+\w+)?)(@\d+)?$/);
								keystrokes.filter(function(keystroke) {
									return reg.test(keystroke);
								});
								keystrokes = keystrokes.map(function(keystroke) {
									var groups = reg.exec(keystroke);
									var delay = groups[3] || groups[2];
									return {
										keystring: groups[1],
										delay: delay ? delay.substr(1) : 1
									};
								});
								processingKeystrokes = true;
								console.log('Sending keystrokes', keystrokes);
								setKeystrokes(keystrokes, 0);
								break;
							case 'open url':
								if (hook.openURL.default) overwolf.utils.openUrlInDefaultBrowser(hook.openURL.url);
								else overwolf.utils.openUrlInOverwolfBrowser(hook.openURL.url);

								break;
							case 'set device lighting':
								if (!isLogitechLedAvailable) return console.log('Hook failed. LogitechLed is not available.');
								if (processingLighting) return console.log('Hook failed. Only one lighting hook can be processed at a time.');

								processingLighting = true;

								q(overwolf.logitech.led.saveCurrentLighting)
									.then(function() {

										var color = tinycolor(hook.keyboard.color).toRgb();
										var red = parseInt(color.r * 100 / 255);
										var green = parseInt(color.g * 100 / 255);
										var blue = parseInt(color.b * 100 / 255);

										var duration = parseInt(hook.keyboard.duration * 1000);
										var interval = parseInt(hook.keyboard.interval);

										switch (hook.keyboard.effect) {
											case 'Fixed':
												overwolf.logitech.led.setLighting(red, green, blue, function() {});
												break;
											case 'Flash':
												overwolf.logitech.led.flashLighting(red, green, blue, duration, interval, function() {});
												break;
											case 'Pulse':
												overwolf.logitech.led.pulseLighting(red, green, blue, duration, interval, function() {});
												break;
										}
										if (hook.keyboard.effect === 'Fixed' && hook.keyboard.ignoreDuration) {
											processingLighting = false;
											return;
										}
										setTimeout(function() {
											q(overwolf.logitech.led.restoreLighting)
												.then(function() {
													processingLighting = false;
												});
										}, duration);

									})
									.catch(function(result) {
										console.log('Failed to set device lighting.', result);
										processingLighting = false;
									});
								break;
							case 'execute lighting macro':
								var macro = $localStorage.macros.filter(function(macro) {
									return macro.id === hook.macro.id;
								});

								if (!macro.length) return console.warn('Hook failed. No lighting macro have been found with the provided id.');
								else macro = macro[0];

								if (!isLogitechLedAvailable) return console.warn('Hook failed. LogitechLed is not available.');
								console.log('Processing lighting macro.', macro);
								setMacroState(macro, 0, event.data);
								break;
							default:
								console.warn('Unmanaged event.', hook.selectedAction);
						}
					});
				});
			});
		}

		function updateRequiredFeatures() {
			overwolf.games.getRunningGameInfo(function(gameInfo) {
				if (!gameInfo) return;

				var currentGameID = parseInt(gameInfo.id / 10);
				var features = [];

				switch (currentGameID) {
					case 7764: //csgo
					case 5426: //lol
					case 7314: //dota2
					case 10798: //rocket league
					case 10624: //hots
					case 6365: //world of tanks
					case 10844: //overwatch
						$localStorage.hooks.forEach(function(hook) {
							var featureName = hook.selectedEvent.featureKey || hook.selectedEvent.name;
							if (hook.selectedGame.id === currentGameID && features.indexOf(featureName) === -1) features.push(featureName);
						});
						if (features.sort().join(', ') !== lastRequiredFeatures.sort().join(', ')) {
							console.log('Setting required features.', features);
							q(overwolf.games.events.setRequiredFeatures, features)
								.then(function(result) {
									console.log('Required features set.', result);
									lastRequiredFeatures = features;
								})
								.catch(function(result) {
									console.error('Error setting required features. Trying again in 5 seg.', result);
									setTimeout(updateRequiredFeatures, 5000);
								});
						}
						break;
				}

			});
		}

		function preloadResources() {
			$localStorage.hooks.forEach(function(hook) {
				switch (hook.selectedAction) {
					case 'play sound':
						if (preloadedResources.indexOf(hook.audio.url) === -1)
							overwolf.media.audio.create(hook.audio.url, function(result) {
								if (result.status === 'success' || result.id) {
									console.log('Sound preloaded.', hook.audio.url);
									preloadedResources.push(hook.audio.url);
								}
							});
						break;
				}
			});
		}

		function messageReceived(event, message) {
			switch (message.id) {
				case 'playerReady':
					Messenger.send('PlayerWindow', 'videoURL', { url: lastOpenedReplay });
					break;
			}
		}

		function gameLaunched() {
			updateRequiredFeatures();

			q(overwolf.windows.getWindowState, 'MainWindow')
				.then(captureOnMinimize);
		}

		function gameInfoUpdated(gameInfo) {
			if (gameInfo.runningChanged) lastRequiredFeatures = [];
		}

		function playSound(url) {
			overwolf.media.audio.create(url, function(result) {
				if (result.status === 'success' || result.id) overwolf.media.audio.play(result.id, function() {});
				else console.error(result.error);
			});
		}

		function setKeystrokes(keystrokes, index) {
			var keystroke = keystrokes[index];
			overwolf.utils.sendKeyStroke(keystroke.keystring);
			if (index + 1 < keystrokes.length) setTimeout(setKeystrokes.bind(null, keystrokes, index + 1), keystroke.delay || 1);
			else processingKeystrokes = false;
		}

		function setMacroState(macro, index, data) {
			var state = macro.states[index];
			var duration = parseInt(state.duration);
			var promises = [];

			for (var i = 0; i < state.data.length; i++) {
				for (var ii = 0; ii < state.data[i].length; ii++) {

					var key = state.data[i][ii];
					var color = tinycolor(key.color);

					if (state.transparent && (key.effect !== 'Pulse') && (color.toHex() === '000000')) continue;

					if (key.condition) {
						try {
							console.log('Key condition detected.', key);
							var parsedCondition = Mustache.render(key.condition, data);
							var result = eval(parsedCondition);
							console.log('Key condition result: ', parsedCondition, result);
							if (!result) continue;
						} catch (err) {
							console.error('Key condition failed with error: ', err.message);
							continue;
						}
					}

					color = color.toRgb();
					var red = parseInt(color.r * 100 / 255);
					var green = parseInt(color.g * 100 / 255);
					var blue = parseInt(color.b * 100 / 255);

					switch (key.effect) {
						case 'Fixed':
							//console.log('Setting fixed lighting for key with name', key.name);
							promises.push(q(overwolf.logitech.led.setLightingForKeyWithKeyName, key.name, red, green, blue));
							break;
						case 'Flash':
							//console.log('Setting flash lighting for key with name', key.name);
							var interval = parseInt(key.interval);
							promises.push(q(overwolf.logitech.led.flashSingleKey, key.name, red, green, blue, duration, interval));
							break;
						case 'Pulse':
							//console.log('Setting pulse lighting for key with name', key.name);
							var finishColor = tinycolor(key.finishColor).toRgb();
							var finishRed = parseInt(finishColor.r * 100 / 255);
							var finishGreen = parseInt(finishColor.g * 100 / 255);
							var finishBlue = parseInt(finishColor.b * 100 / 255);
							promises.push(q(overwolf.logitech.led.pulseSingleKey, key.name, red, green, blue, finishRed, finishGreen, finishBlue, duration, false));
							break;
					}
				}
			}

			Promise.all(promises)
				.then(function() {
					if (index + 1 < macro.states.length) setTimeout(setMacroState.bind(null, macro, index + 1, data), duration);
					else console.log('Lighting macro finished.');
				});
		}

		function openReplay(url) {
			lastOpenedReplay = url;

			q(overwolf.windows.obtainDeclaredWindow, 'PlayerWindow')
				.then(function(result) {
					if (result.window.isVisible) Messenger.send('PlayerWindow', 'videoURL', { url: url });
					else overwolf.windows.restore(result.window.id, function() {});
				});
		}

		function hotkeysHandler(result) {
			if (result.status !== 'success') return;

			switch (result.featureId) {
				case 'toggle-capture':
					toggleCapture();
					break;
				case 'instant-replay':
					overwolf.media.replays.capture(20000, 1,
						function(result) {
							//finished callback
							if (result.status === 'success') {
								Messenger.send('NotificationWindow', 'showNotification', {
									type: 'success',
									text: 'Replay captured.'
								});
								openReplay(result.url);
							} else notifyError(result);
						},
						function(result) {
							//status callback
							if (result.error) notifyError(result);
						}
					);
					break;
			}
		}

		function toggleCapture(state) {
			return new Promise(function(resolve, reject) {
				var turnOn = function() {
					var captureSettings = {
						settings: {
							video: {
								buffer_length: suggestedCaptureBufferLength
							}
						}
					};

					console.log('Turning on replay capture with a buffer length of', suggestedCaptureBufferLength);

					q(overwolf.media.replays.turnOn, captureSettings)
						.then(function() {
							currentCaptureBufferLength = suggestedCaptureBufferLength;
							Messenger.send('NotificationWindow', 'showNotification', {
								type: 'success',
								text: 'Replay capture enabled.'
							});
							resolve(true);
						})
						.catch(function(result) {
							notifyError(result);
							resolve();
						});
				};

				var turnOff = function() {
					q(overwolf.media.replays.turnOff)
						.then(function() {
							Messenger.send('NotificationWindow', 'showNotification', {
								type: 'warning',
								text: 'Replay capture stopped.'
							});
							resolve(false);
						})
						.catch(function() {
							resolve();
						});
				};

				if (state !== undefined) {
					if (state) turnOn();
					else turnOff();
				} else {
					q(overwolf.media.replays.getState)
						.then(function(result) {
							if (result.isOn) turnOff();
							else turnOn();
						});
				}
			});
		}

		function captureOnMinimize(result) {
			overwolf.games.getRunningGameInfo(function(gameInfo) {
				if (!gameInfo) return;

				if ($localStorage.settings.captureOnMinimize && (result.window_name === 'MainWindow' || result.window_id === 'MainWindow') && result.window_state === 'minimized') {
					q(overwolf.media.replays.getState)
						.then(function(result) {
							if (result.isOn) {
								if (currentCaptureBufferLength !== suggestedCaptureBufferLength) {
									toggleCapture(false)
										.then(function() {
											toggleCapture(true);
										});
								}
							} else {
								toggleCapture(true);
							}
						});
				}
			});
		}

		function checkForTheOptimalCaptureBufferLength() {
			var max;

			var hooks = $localStorage.hooks.filter(function(hook) {
				return hook.selectedAction === 'save replay';
			});

			if (hooks.length) max = Math.max.apply(Math, hooks.map(function(hook) {	return Math.abs(hook.replay.pastDuration) * 1000; }));

			suggestedCaptureBufferLength = (max && max > 20000) ? max : 20000;
		}

		function notifyError(result) {
			switch (result.error) {
				case 'Not in a game.':
					result.error = 'You need to be in a game to turn this feature on.';
					break;
			}
			Messenger.send('NotificationWindow', 'showNotification', {
				type: 'error',
				text: result.error
			});
		}

		overwolf.games.events.onNewEvents.addListener(newEventReceived);
		overwolf.games.events.onInfoUpdates2.addListener(newInfoUpdateReceived);
		overwolf.games.events.onError.addListener(notifyError);

		overwolf.media.replays.onCaptureError.addListener(notifyError);

		overwolf.games.onGameLaunched.addListener(gameLaunched);
		overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdated);

		overwolf.settings.registerHotKey('toggle-capture', hotkeysHandler);
		overwolf.settings.registerHotKey('instant-replay', hotkeysHandler);

		$rootScope.$on('message-received', messageReceived);

		overwolf.windows.onStateChanged.addListener(captureOnMinimize);

		return {
			updateRequiredFeatures: updateRequiredFeatures,
			preloadResources: preloadResources,
			openReplay: openReplay,
			toggleCapture: toggleCapture,
			checkForTheOptimalCaptureBufferLength: checkForTheOptimalCaptureBufferLength,
			newEvent: newEventReceived
		};
	});