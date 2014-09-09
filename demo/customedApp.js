/*
 *  1) set buttongroup template for formly
 *  2) override bsRadioDirective/ bsCheckboxDirective / bsCheckboxGroupDirective / $parseOptions 
 *     for advanced function like buttongroup, groupby select  
 */
app.config(function ($provide, formlyConfigProvider) {
	$provide.decorator('bsRadioDirective', function ($delegate) {
		$delegate.shift();
		return $delegate;
	});

	$provide.decorator('bsCheckboxDirective', function ($delegate) {
		$delegate.shift();
		return $delegate;
	});

	$provide.decorator('bsCheckboxGroupDirective', function ($delegate) {
		$delegate.shift();
		return $delegate;
	});

	$provide.decorator('bsTimepickerDirective', function ($delegate) {
		$delegate.shift();
		return $delegate;
	})

	$provide.decorator('$parseOptions', function ($delegate) {
		$delegate.shift();
		return $delegate;
	});

	formlyConfigProvider.setTemplateUrl({
		date: "views/custom-field-datepicker.html",
		time: "views/custom-field-timepicker.html",
		buttongroup: 'views/custom-field-buttongroup.html',
		money: 'views/custom-field-money.html',
		separator: 'views/custom-field-separator.html',
		phone: 'views/custom-field-phone.html',
		signature: 'views/custom-field-signature.html'
	})
});

/*
 *	custom bsRadio directive
 *  the reason of overriding build-in bsRadio Directive is:
 *  build-in bsRadio Directive doesn't handle well with ng-value
 */
app.directive('bsRadio', ['$button', '$$rAF', function ($button, $$rAF) {
	var defaults = $button.defaults;
	var constantValueRegExp = /^(true|false|\d+)$/;
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function postLink(scope, element, attr, controller) {
			var options = defaults;
			var isInput = element[0].nodeName === 'INPUT';
			var activeElement = isInput ? element.parent() : element;

			console.log('test overriding directive....custome directive:bsRadio')

			var value;
			if (attr.ngValue) {
				value = scope.$eval(attr.ngValue);
			} else {
				value = constantValueRegExp.test(attr.value) ? scope.$eval(attr.value) : attr.value;
			}
			// model -> view
			controller.$render = function () {
				console.log("$render", value);
				// console.warn('$render', element.attr('value'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
				var isActive = angular.equals(controller.$modelValue, value);
				$$rAF(function () {
					if (isInput)
						element[0].checked = isActive;
					activeElement.toggleClass(options.activeClass, isActive);
				});
			};
			// view -> model
			element.bind(options.toggleEvent, function () {
				scope.$apply(function () {
					// console.warn('!click', element.attr('value'), 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue, 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue);
					controller.$setViewValue(value);
					controller.$render();
				});
			});
		}
	};
}]);

/*
 *	custom bsCheckboxGroup directive
 *  the reason of overriding build-in bsCheckboxGroup Directive is:
 *  build-in bsCheckboxGroup Diretive doesn't handler well with ng-value
 */
app.directive('bsCheckboxGroup', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		compile: function postLink(element, attr) {
			console.log('test overriding directive....custome directive: bsCheckboxGroup')
			element.attr('data-toggle', 'buttons');
			element.removeAttr('ng-model');
			var children = element[0].querySelectorAll('input[type="checkbox"]');
			angular.forEach(children, function (child) {
				var childEl = angular.element(child);
				childEl.attr('bs-checkbox', '');
				childEl.attr('ng-model', attr.ngModel);
			});
		}

	};
});

/*
 *	custom bsCheckbox directive
 *  the reason of overriding build-in bsCheckbox Directive are:
 *  1) build-in bsCheckbox Directive doesn't work well when the bsCheckbox has attribute ng-value
 *  2) build-in bsCheckbox Directive doesn't handler checkbox group
 */
app.directive('bsCheckbox', function ($button, $$rAF) {
	var defaults = $button.defaults;
	var constantValueRegExp = /^(true|false|\d+)$/;

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function postLink(scope, element, attr, controller) {
			console.log('test overriding directive....custome directive: bsCheckbox')
			var options = defaults;
			// Support label > input[type="checkbox"]
			var isInput = element[0].nodeName === 'INPUT';
			var activeElement = isInput ? element.parent() : element;

			var trueValue;
			if (attr.ngValue) {
				trueValue = scope.$eval(attr.ngValue);
			} else {
				if (constantValueRegExp.test(attr.trueValue)) trueValue = scope.$eval(attr.trueValue);
			}
			trueValue = trueValue ? trueValue : true;

			var falseValue = angular.isDefined(attr.falseValue) ? attr.falseValue : false;
			if (constantValueRegExp.test(attr.falseValue)) {
				falseValue = scope.$eval(attr.falseValue);
			}

			// Parse exotic values
			var hasExoticValues = typeof trueValue !== 'boolean' || typeof falseValue !== 'boolean';
			if (hasExoticValues) {
				controller.$parsers.push(function (viewValue) {
					var modelValue, index;
					if (angular.isArray(controller.$modelValue)) {
						modelValue = controller.$modelValue.concat([]);
					} else {
						modelValue = [];
						if (angular.isDefined(controller.$modelValue)) console.error("ButtonGroup error:", "The gaven value isn't an Array.");
					}

					index = modelValue.indexOf(trueValue);
					if (viewValue) {
						if (index === -1) {
							modelValue.push(trueValue);
						}
					} else {
						if (index > -1) modelValue.splice(index, 1);
					}
					return modelValue;
				});
				// Fix rendering for exotic values
				scope.$watch(attr.ngModel, function (newValue, oldValue) {
					controller.$render();
				});
			}

			// model -> view
			controller.$render = function () {
				// console.warn('$render', element.attr('ng-model'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
				var isActive;
				if (hasExoticValues) {
					if (angular.isDefined(controller.$modelValue)) {
						if (angular.isArray(controller.$modelValue)) {
							isActive = controller.$modelValue.indexOf(trueValue) > -1;
						} else {
							isActive = false;
							console.error("ButtonGroup error:", "The gaven value isn't an Array.");
						}
					}
				} else {
					isActive = angular.equals(controller.$modelValue, trueValue);
				}
				$$rAF(function () {
					if (isInput) element[0].checked = isActive;
					activeElement.toggleClass(options.activeClass, isActive);
				});
			};

			// view -> model
			element.bind(options.toggleEvent, function () {
				scope.$apply(function () {
					if (!isInput) {
						controller.$setViewValue(!activeElement.hasClass('active'));
					}
					if (!hasExoticValues) {
						controller.$render();
					}
				});
			});
		}
	};
});

/*
 *	custom provider $parseOptions
 *  the reason of overriding build-in $parseOptions provider is:
 *  build-in $parseOptions provider doesn't handle ng-optons with groupby.
 */
app.provider('$parseOptions', function () {
	var defaults = this.defaults = { regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/ };
	this.$get = ['$parse', '$q', function ($parse, $q) {
		function ParseOptionsFactory(attr, config) {
			console.log('test overriding provider....custome provider: $parseOptions')
			var $parseOptions = {};
			// Common vars
			var options = angular.extend({}, defaults, config);
			$parseOptions.$values = [];
			// Private vars
			var match, displayFn, valueName, keyName, groupByFn, valueFn, valuesFn;
			$parseOptions.init = function () {
				$parseOptions.$match = match = attr.match(options.regexp);
				displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], keyName = match[5], groupByFn = $parse(match[3] || ''), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]);
			};
			$parseOptions.valuesFn = function (scope, controller) {
				return $q.when(valuesFn(scope, controller)).then(function (values) {
					$parseOptions.$values = values ? parseValues(values, scope) : {};
					return $parseOptions.$values;
				});
			};
			// Private functions: parse all kinds of value to an object like {label: String, value: String, group: String}
			// so that template can easy use data with same structure.
			function parseValues(values, scope) {
				var results, hasGroup;
				results = values.map(function (match, index) {
					var locals = {}, label, value, group;
					locals[valueName] = match;
					label = displayFn(scope, locals);
					value = valueFn(scope, locals) || index;
					group = groupByFn(scope, locals);
					if (group) hasGroup = true;
					return {
						label: label,
						value: value,
						group: group
					};
				});
				if (hasGroup) return sortValuesByGroup(results);
				return results;
			}

			function sortValuesByGroup(values) {
				var groups = {}, results = [];
				values.map(function (val, index) {
					groups[val.group] = groups[val.group] ? groups[val.group] : [];
					groups[val.group].push({label: val.label, value: val.value, group: val.group});
				});
				angular.forEach(groups, function (group) {
					results = results.concat(group);
				})
				return results;
			}

			$parseOptions.init();
			return $parseOptions;
		}

		return ParseOptionsFactory;
	}];
});

app.directive('bsTimepicker', [
	'$window',
	'$parse',
	'$q',
	'$locale',
	'dateFilter',
	'$timepicker',
	'$dateParser',
	'$timeout',
	function ($window, $parse, $q, $locale, dateFilter, $timepicker, $dateParser, $timeout) {
		var defaults = $timepicker.defaults;
		var isNative = /(ip(a|o)d|iphone|android)/gi.test($window.navigator.userAgent);
		var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
		return {
			restrict: 'EAC',
			require: 'ngModel',
			link: function postLink(scope, element, attr, controller) {
				// Directive options
				var options = {
					scope: scope,
					controller: controller
				};
				angular.forEach([
					'placement',
					'container',
					'delay',
					'trigger',
					'keyboard',
					'html',
					'animation',
					'template',
					'autoclose',
					'timeType',
					'timeFormat',
					'modelTimeFormat',
					'useNative',
					'hourStep',
					'minuteStep',
					'length',
					'arrowBehavior'
				], function (key) {
					if (angular.isDefined(attr[key]))
						options[key] = attr[key];
				});
				// Visibility binding support
				attr.bsShow && scope.$watch(attr.bsShow, function (newValue, oldValue) {
					if (!timepicker || !angular.isDefined(newValue))
						return;
					if (angular.isString(newValue))
						newValue = newValue.match(',?(timepicker),?');
					newValue === true ? timepicker.show() : timepicker.hide();
				});
				// Initialize timepicker
				if (isNative && (options.useNative || defaults.useNative))
					options.timeFormat = 'HH:mm';
				var timepicker = $timepicker(element, controller, options);
				options = timepicker.$options;
				// Initialize parser
				var dateParser = $dateParser({
					format: options.timeFormat,
					lang: options.lang
				});
				// Observe attributes for changes
				angular.forEach([
					'minTime',
					'maxTime'
				], function (key) {
					// console.warn('attr.$observe(%s)', key, attr[key]);
					angular.isDefined(attr[key]) && attr.$observe(key, function (newValue) {
						console.log(key, ':', newValue);
						// if newValue is exit, which is not a empty string, then parse newValue
						if (!!newValue) {
							if (newValue === 'now') {
								timepicker.$options[key] = new Date().setFullYear(1970, 0, 1);
							} else if (angular.isString(newValue) && newValue.match(/^".+"$/)) {
								console.log('test')
								timepicker.$options[key] = +new Date(newValue.substr(1, newValue.length - 2));
							} else {
								timepicker.$options[key] = dateParser.parse(newValue, new Date(1970, 0, 1, 0));
							}
						}
						console.log('timepicker.$options.', key, timepicker.$options[key]);
						!isNaN(timepicker.$options[key]) && timepicker.$build();
					});
				});
				// Watch model for changes
				scope.$watch(attr.ngModel, function (newValue, oldValue) {
					// console.warn('scope.$watch(%s)', attr.ngModel, newValue, oldValue, controller.$dateValue);
					timepicker.update(controller.$dateValue);
				}, true);
				// viewValue -> $parsers -> modelValue
				controller.$parsers.unshift(function (viewValue) {
					// console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
					// Null values should correctly reset the model value & validity
					if (!viewValue) {
						controller.$setValidity('date', true);
						return;
					}
					var parsedTime = dateParser.parse(viewValue, controller.$dateValue);
					if (!parsedTime || isNaN(parsedTime.getTime())) {
						controller.$setValidity('date', false);
					} else {
						var isValid = parsedTime.getTime() >= options.minTime && parsedTime.getTime() <= options.maxTime;
						controller.$setValidity('date', isValid);
						// Only update the model when we have a valid date
						if (isValid)
							controller.$dateValue = parsedTime;
					}
					if (options.timeType === 'string') {
						return dateFilter(parsedTime, options.modelTimeFormat || options.timeFormat);
					} else if (options.timeType === 'number') {
						return controller.$dateValue.getTime();
					} else if (options.timeType === 'iso') {
						return controller.$dateValue.toISOString();
					} else {
						return new Date(controller.$dateValue);
					}
				});
				// modelValue -> $formatters -> viewValue
				controller.$formatters.push(function (modelValue) {
					// console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
					var date;
					if (angular.isUndefined(modelValue) || modelValue === null) {
						date = NaN;
					} else if (angular.isDate(modelValue)) {
						date = modelValue;
					} else if (options.timeType === 'string') {
						date = dateParser.parse(modelValue, null, options.modelTimeFormat);
					} else {
						date = new Date(modelValue);
					}
					// Setup default value?
					// if(isNaN(date.getTime())) date = new Date(new Date().setMinutes(0) + 36e5);
					controller.$dateValue = date;
					return controller.$dateValue;
				});
				// viewValue -> element
				controller.$render = function () {
					// console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
					element.val(!controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : dateFilter(controller.$dateValue, options.timeFormat));
				};
				// Garbage collection
				scope.$on('$destroy', function () {
					timepicker.destroy();
					options = null;
					timepicker = null;
				});
			}
		};
	}
]);

/*
 *	Directive for field helper: fieldHelp
 *  which is presented with a question mark in a circle,
 *  hover the question mark will show an "AngularStrap popover" with helper content
 *  blue will hide that "popover"
 */
app.directive('fieldHelp', function () {
	return {
		restrict: 'AE',
		templateUrl: 'views/field-help.html'
	}
});


/**
 * Heavily adapted from the `type="number"` directive in Angular's
 * /src/ng/directive/input.js
 */

app.directive('money', function () {
	'use strict';

	var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

	function link(scope, el, attrs, ngModelCtrl) {
		var min = parseFloat(attrs.min || 0);
		var precision = parseFloat(attrs.precision || 2);
		var lastValidValue;

		function round(num) {
			var d = Math.pow(10, precision);
			return Math.round(num * d) / d;
		}

		function formatPrecision(value) {
			return parseFloat(value).toFixed(precision);
		}

		function formatViewValue(value) {
			return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
		}


		ngModelCtrl.$parsers.push(function (value) {
			if (angular.isUndefined(value)) {
				value = '';
			}

			// Handle leading decimal point, like ".5"
			if (value.indexOf('.') === 0) {
				value = '0' + value;
			}

			// Allow "-" inputs only when min < 0
			if (value.indexOf('-') === 0) {
				if (min >= 0) {
					value = null;
					ngModelCtrl.$setViewValue('');
					ngModelCtrl.$render();
				} else if (value === '-') {
					value = '';
				}
			}

			var empty = ngModelCtrl.$isEmpty(value);
			if (empty || NUMBER_REGEXP.test(value)) {
				lastValidValue = (value === '')
					? null
					: (empty ? value : parseFloat(value));
			} else {
				// Render the last valid input in the field
				ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
				ngModelCtrl.$render();
			}

			ngModelCtrl.$setValidity('number', true);
			return lastValidValue;
		});
		ngModelCtrl.$formatters.push(formatViewValue);

		var minValidator = function (value) {
			if (!ngModelCtrl.$isEmpty(value) && value < min) {
				ngModelCtrl.$setValidity('min', false);
				return undefined;
			} else {
				ngModelCtrl.$setValidity('min', true);
				return value;
			}
		};
		ngModelCtrl.$parsers.push(minValidator);
		ngModelCtrl.$formatters.push(minValidator);

		if (attrs.max) {
			var max = parseFloat(attrs.max);
			var maxValidator = function (value) {
				if (!ngModelCtrl.$isEmpty(value) && value > max) {
					ngModelCtrl.$setValidity('max', false);
					return undefined;
				} else {
					ngModelCtrl.$setValidity('max', true);
					return value;
				}
			};

			ngModelCtrl.$parsers.push(maxValidator);
			ngModelCtrl.$formatters.push(maxValidator);
		}

		// Round off
		if (precision > -1) {
			ngModelCtrl.$parsers.push(function (value) {
				return value ? round(value) : value;
			});
			ngModelCtrl.$formatters.push(function (value) {
				return value ? formatPrecision(value) : value;
			});
		}

		el.bind('blur', function () {
			var value = ngModelCtrl.$modelValue;
			if (value) {
				ngModelCtrl.$viewValue = formatPrecision(value);
				ngModelCtrl.$render();
			}
		});
	}

	return {
		restrict: 'A',
		require: 'ngModel',
		link: link
	};
});

/**
 * ngSignaturePad - v0.1.0 - 2013-12-02
 * https://github.com/marcorinck/ngSignaturePad
 * Copyright (c) 2013 ; Licensed MIT
 */
app.directive('mrSignaturePad', [
	'$window',
	function ($window) {
		'use strict';
		var signaturePad, canvas, scope, element, EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
		function calculateHeight($element) {
			return parseInt($element.css('height'), 10) - 70;
		}
		function calculateWidth($element) {
			return parseInt($element.css('width'), 10) - 25;
		}
		function setCanvasHeightAndWidth() {
			var height = calculateHeight(element), width = calculateWidth(element);
			scope.signatureWidth = width;
			scope.signatureHeight = height;
			canvas.attr('height', height);
			canvas.attr('width', width);
		}
		$window.addEventListener('resize', function () {
			scope.$apply(function () {
				var img = signaturePad.toDataURL();
				setCanvasHeightAndWidth();
				signaturePad.fromDataURL(img);
			});
		}, false);
		$window.addEventListener('orientationchange', function () {
			scope.$apply(function () {
				var img = signaturePad.toDataURL();
				setCanvasHeightAndWidth();
				signaturePad.fromDataURL(img);
			});
		}, false);
		return {
			restrict: 'A',
			replace: true,
			template: '<div class="signature-background">' + '<div class="action">' + '<button ng-click="accept()">OK</button>' + '<button " ng-click="clear()">Empty</button>' + '</div>' + '<div class="signature" ng-style="{height: signatureHeight, width: signatureWidth}" >' + '<canvas></canvas>' + '</div>' + '</div>',
			scope: {
				signature: '=signature',
				close: '&'
			},
			controller: [
				'$scope',
				function ($scope) {
					$scope.accept = function () {
						if (!signaturePad.isEmpty()) {
							$scope.signature.dataUrl = signaturePad.toDataURL();
							$scope.signature.$isEmpty = false;
						} else {
							$scope.signature.dataUrl = EMPTY_IMAGE;
							$scope.signature.$isEmpty = true;
						}
						$scope.close();
					};
					$scope.clear = function () {
						signaturePad.clear();
						setCanvasHeightAndWidth();
					};
				}
			],
			link: function ($scope, $element) {
				canvas = $element.find('canvas');
				scope = $scope;
				element = $element;
				signaturePad = new SignaturePad(canvas.get(0));
				setCanvasHeightAndWidth();
				if ($scope.signature && !$scope.signature.$isEmpty && $scope.signature.dataUrl) {
					signaturePad.fromDataURL($scope.signature.dataUrl);
				}
			}
		};
	}
]);