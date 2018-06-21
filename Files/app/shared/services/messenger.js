angular
	.module('gemApp')
	.service('Messenger', function($rootScope) {
		overwolf.windows.onMessageReceived.addListener(function(message) {
			$rootScope.$broadcast('message-received', message);
		});

		return {
			send: function(windowName, messageID, messageData) {
				if (typeof windowName !== 'string') return console.error('Messenger first parameter must be a string.');
				messageID = (typeof messageID === 'string') ? messageID : '';
				messageData = (typeof messageData === 'object') ? messageData : {};
				overwolf.windows.obtainDeclaredWindow(windowName, function(result) {
					if (result.status === 'success') overwolf.windows.sendMessage(result.window.id, messageID, JSON.stringify(messageData), function() {});
				});
			}
		};
	});