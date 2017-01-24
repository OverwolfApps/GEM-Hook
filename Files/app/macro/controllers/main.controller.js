(function() {
	'use strict';

	angular
		.module('gemApp')
		.controller('MainController', MainController);

	function MainController($scope, $localStorage) {

		var usKeyboard = [
			["ESC", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "PRINT_SCREEN", "SCROLL_LOCK", "PAUSE_BREAK"],
			["TILDE", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "ZERO", "MINUS", "EQUALS", "BACKSPACE", "INSERT", "HOME", "PAGE_UP", "NUM_LOCK", "NUM_SLASH", "NUM_ASTERISK", "NUM_MINUS"],
			["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "OPEN_BRACKET", "CLOSE_BRACKET", "BACKSLASH", "KEYBOARD_DELETE", "END", "PAGE_DOWN", "NUM_SEVEN", "NUM_EIGHT", "NUM_NINE", "NUM_PLUS"],
			["CAPS_LOCK", "A", "S", "D", "F", "G", "H", "J", "K", "L", "SEMICOLON", "APOSTROPHE", "ENTER", "NUM_FOUR", "NUM_FIVE", "NUM_SIX"],
			["LEFT_SHIFT", "Z", "X", "C", "V", "B", "N", "M", "COMMA", "PERIOD", "FORWARD_SLASH", "RIGHT_SHIFT", "ARROW_UP", "NUM_ONE",	"NUM_TWO", "NUM_THREE",	"NUM_ENTER"],
			["LEFT_CONTROL", "LEFT_WINDOWS", "LEFT_ALT", "SPACE", "RIGHT_ALT",	"RIGHT_WINDOWS", "APPLICATION_SELECT", "RIGHT_CONTROL", "ARROW_LEFT", "ARROW_DOWN",	"ARROW_RIGHT", "NUM_ZERO", "NUM_PERIOD"]
		];
		var baseKeys = [];

		$scope.macros = angular.copy($localStorage.macros);
		$scope.selectedStateIndex = 0;
		$scope.properties = {};
		$scope.selectedKeys = [];

		$scope.infos = {
			transparent: 'When set to true, the black keys will not be processed for this state.',
			condition: '-[ADVANCED]-\nA valid javascript statement. If the result of the statement is true, the key will be processed. You can use variables the same way as with the notifications, using double curly braces.\n\nExamples:\n"{{bomb}}" == "exploded"\n{{weapon_current_ammo}} <= 5\n\nTo learn more visit the forums at forums.overwolf.com.'
		};

		$scope.$watch('selectedKeys', function(newValue, oldValue) {
			if (newValue.length) {
				var names = newValue.map(function(key) {
					return key.name;
				});
				$scope.properties = angular.copy(newValue[0]);
				$scope.properties.name = names.join(', ');
			}
		});

		$scope.$watch('properties', function(newValue, oldValue) {
			var properties = angular.copy($scope.properties);
			delete properties.name;
			$scope.selectedKeys.forEach(function(key, index, array) {
				angular.extend(key, properties);
			});
		}, true);

		$scope.colorPickerEventApi = {
			onBlur: function(api, color, $event) {
				$scope.properties.color = tinycolor($scope.properties.color).isValid() ? $scope.properties.color : 'rgb(0, 0, 0)';
				$scope.properties.finishColor = tinycolor($scope.properties.finishColor).isValid() ? $scope.properties.finishColor : 'rgb(0, 0, 0)';
			}
		};

		$scope.reset = function() {
			angular.extend($scope.properties, {
				condition: '',
				action: 'Set Lighting',
				effect: 'Fixed',
				color: 'rgb(0, 0, 0)',
				finishColor: 'rgb(0, 0, 0)',
				interval: '150'
			});
		};

		$scope.addState = function() {
			var index = $scope.selectedMacro.states.push({
				duration: 2000,
				transparent: true,
				data: angular.copy(baseKeys)
			});
			$scope.selectedStateIndex = index - 1;
			deselectKeys();
		};

		$scope.selectState = function(index) {
			if ($scope.selectedStateIndex !== index) {
				$scope.selectedStateIndex = index;
				deselectKeys();
			}
		};

		$scope.removeState = function(index) {
			$scope.selectedMacro.states.splice(index, 1);
			$scope.selectedStateIndex = (index - 1 > 0) ? index - 1 : 0;
			if ($scope.selectedStateIndex === index) deselectKeys();
		};

		$scope.addMacro = function() {
			var index = $scope.macros.push({
				id: getIndex(),
				name: 'New macro',
				states: []
			});
			$scope.selectedMacro = $scope.macros[index - 1];
			$scope.addState();
			deselectKeys();
		};

		$scope.changeName = function() {
			var result = prompt('Name', $scope.selectedMacro.name);
			if (result) $scope.selectedMacro.name = result;
		};

		$scope.deleteMacro = function() {
			var index = $scope.macros.indexOf($scope.selectedMacro);
			if (index !== -1) {
				$scope.macros.splice(index, 1);
				$scope.selectedMacro = undefined;
			}
		};

		$scope.keysSelected = function(keysArr) {
			$scope.selectedKeys = keysArr.map(function(key) {
				return angular.element(key).scope().key;
			});
			$scope.$digest();
		};

		$scope.save = function() {
			$localStorage.macros = $scope.macros;
			$localStorage.$apply();
			overwolf.windows.close('macroWindow', function() {});
		};

		function getIndex() {
			var values = [];
			$scope.macros.forEach(function(macro) {
				values.push(macro.id);
			});
			return (values.length ? (Math.max.apply(null, values) + 1) : 0);
		}

		function deselectKeys() {
			$scope.selectedKeys = [];
		}

		function init() {
			for (var i = 0; i < usKeyboard.length; i++) {
				baseKeys[i] = [];
				for (var ii = 0; ii < usKeyboard[i].length; ii++) {
					baseKeys[i][ii] = {
						name: usKeyboard[i][ii],
						condition: '',
						action: 'Set Lighting',
						effect: 'Fixed',
						color: 'rgb(0, 0, 0)',
						finishColor: 'rgb(0, 0, 0)',
						interval: '150'
					};
				}
			}
		}

		init();
	}

}());