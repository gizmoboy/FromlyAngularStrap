'use strict';
// Angular Init
var app = angular.module('app', ['ng', 'ui.router', 'hljs', 'formly', 'mgcrea.ngStrap']);

app.constant('usingCustomTypeTemplates', window.localStorage.getItem('useCustomTypeTemplates') === 'true');

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $provide, formlyConfigProvider, usingCustomTypeTemplates) {
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

	$locationProvider.html5Mode(false);
	$locationProvider.hashPrefix('!');

	$urlRouterProvider.otherwise('/');

	$stateProvider.state('home', {
		url: '/',
		title: 'Formly for Angular',
		templateUrl: 'views/home.html',
		controller: 'home'
	});
	
	if (usingCustomTypeTemplates) {
		formlyConfigProvider.setTemplateUrl('text', 'views/custom-field-text.html');
		// or
		formlyConfigProvider.setTemplateUrl({
			radio: 'views/custom-field-radio.html',
			checkbox: 'views/custom-field-checkbox.html',
			select: 'views/custom-field-select.html'
		});
	}

	formlyConfigProvider.setTemplate('inline-custom', '<label>Inline-custom template</label><br /><input ng-model="result[options.key || index]" class="form-control">')
	formlyConfigProvider.setTemplateUrl({
		buttongroup: 'views/custom-field-buttongroup.html' 
	})
});

app.run(function($rootScope, $state, $stateParams, $window) {
	// loading animation
	$rootScope.setLoading = function() {
		$rootScope.isViewLoading = true;
	};

	$rootScope.unsetLoading = function() {
		$rootScope.isViewLoading = false;
	};

	$rootScope.isViewLoading = true;

	$rootScope.$on('$viewContentLoading', function(ev, to, toParams, from, fromParams) {
		console.log('viewContentLoading');
		$rootScope.setLoading();
	});

	$rootScope.$on('$viewContentLoaded', function(ev, to, toParams, from, fromParams) {
		console.log('viewContentLoaded');
		$rootScope.unsetLoading();
	});

	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
		if (error)
			console.log('stateChangeError:', error.data);
	});
});


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
					if (angular.isArray(controller.$modelValue)) {
						var modelValue = controller.$modelValue.concat([]);
						var index = modelValue.indexOf(trueValue);
						if (viewValue) {
							if (index === -1) {
								modelValue.push(trueValue);
							}
						} else {
							if (index > -1) modelValue.splice(index, 1);
						}
						return modelValue;
					} else {
						// console.warn('$parser', element.attr('ng-model'), 'viewValue', viewValue);
						return viewValue ? trueValue : falseValue;	
					}
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
				if (angular.isArray(controller.$modelValue)) {
					isActive = controller.$modelValue.indexOf(trueValue) > -1;
				} else {
					isActive = angular.equals(controller.$modelValue, trueValue);
				}
				//var isActive = angular.equals(controller.$modelValue, trueValue);
				$$rAF(function() {
					if(isInput) element[0].checked = isActive;
					activeElement.toggleClass(options.activeClass, isActive);
				});
			};

			// view -> model
			element.bind(options.toggleEvent, function() {
				scope.$apply(function () {

					// console.warn('!click', element.attr('ng-model'), 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue, 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue);
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

})