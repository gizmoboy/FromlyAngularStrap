'use strict';
app.directive('fieldHelper', function ($compile) {
	return {
		restrict: 'A',
		require: 'ngModel',
		//tempalte: ''
		link: function (scope, ele, attr, controller) {
			var template = '<button title="{{key}}" data-placement="top-right" data-content="{{label}}" data-animation="am-flip-x" bs-popover ><img src="question_mark.png" width="12" height="12"></button>';
			var element = angular.element(template);
      		$compile(element)(scope);
      		ele.after(element);
		}
	}
});