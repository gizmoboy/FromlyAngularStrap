/*
 *  1) set buttongroup template for formly
 *  2) override bsRadioDirective/ bsCheckboxDirective / bsCheckboxGroupDirective / $parseOptions 
 *     for advanced function like buttongroup, groupby select  
 */
app.config(function($provide, formlyConfigProvider) {
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

	$provide.decorator('$parseOptions', function ($delegate) {
		$delegate.shift();
		return $delegate;
	});
	
	formlyConfigProvider.setTemplateUrl({
		datepicker: "views/custom-field-datepicker.html",
		timepicker: "views/custom-field-timepicker.html",
		buttongroup: 'views/custom-field-buttongroup.html' 
	})
});

/*
 *	custom bsRadio directive
 *  the reason of overriding build-in bsRadio Directive is:
 *  build-in bsRadio Diretive desn't handler well with ng-value
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
app.directive('bsCheckboxGroup', function() {
    return {
		restrict: 'A',
		require: 'ngModel',
		compile: function postLink(element, attr) {
			console.log('test overriding directive....custome directive: bsCheckboxGroup')
			element.attr('data-toggle', 'buttons');
			element.removeAttr('ng-model');
			var children = element[0].querySelectorAll('input[type="checkbox"]');
			angular.forEach(children, function(child) {
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
app.directive('bsCheckbox', function($button, $$rAF) {
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
			if(constantValueRegExp.test(attr.falseValue)) {
				falseValue = scope.$eval(attr.falseValue);
			}

			// Parse exotic values
			var hasExoticValues = typeof trueValue !== 'boolean' || typeof falseValue !== 'boolean';
			if(hasExoticValues) {
				controller.$parsers.push(function(viewValue) {
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
				scope.$watch(attr.ngModel, function(newValue, oldValue) {
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
				$$rAF(function() {
					if(isInput) element[0].checked = isActive;
					activeElement.toggleClass(options.activeClass, isActive);
				});
			};

			// view -> model
			element.bind(options.toggleEvent, function() {
				scope.$apply(function () {
					if(!isInput) {
						controller.$setViewValue(!activeElement.hasClass('active'));
					}
					if(!hasExoticValues) {
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

			function sortValuesByGroup (values) {
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