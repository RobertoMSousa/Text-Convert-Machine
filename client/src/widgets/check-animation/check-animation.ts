
interface ICheckAnimationScope extends angular.IScope {
}

class CheckAnimationController {
	constructor(
		private $scope: ICheckAnimationScope
	) {
	}
}

angular.module('AppPlatform.widgets.checkAnimation', [])
.controller('CheckAnimationController', ['$scope', AController(CheckAnimationController)])
.directive('checkAnimation', [function() {
	return {
		restrict: 'E',
		transclude: false,
		scope: {
		},
		template: require('./check-animation.pug')(),
		controller: 'CheckAnimationController',
		controllerAs: 'ctrl'
	};
}]);
