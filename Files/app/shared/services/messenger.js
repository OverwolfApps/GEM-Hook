(function() {
	'use strict';

	angular
		.module('gemApp')
		.service('messenger', messenger);

	function messenger($rootScope) {

		overwolf.windows.onMessageReceived.addListener(function(message) {
			$rootScope.$broadcast('message-received', message);
		});

		return {
			send: function(windowName, messageID, messageData) {
				if (typeof windowName !== 'string') return console.error('Messenger first parameter must be a string.');
				messageID = (typeof messageID === 'string') ? messageID : '';
				messageData = (typeof messageData === 'object') ? messageData : {};
				console.log('Sending message to', windowName, 'with ID', messageID, messageData);
				q(overwolf.windows.obtainDeclaredWindow, windowName)
					.then(function(result) {
						overwolf.windows.sendMessage(result.window.id, messageID, JSON.stringify(messageData), function(result) {
							console.log('Message result', result);
						});
					});
			}
		};
	}

}());