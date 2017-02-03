
interface ILoadingAnimationScope extends angular.IScope {
}

class LoadingAnimationController {
	constructor(
		private $scope: ILoadingAnimationScope
	) {
	}
}

angular.module('AppPlatform.widgets.loadingAnimation', [])
.controller('LoadingAnimationController', ['$scope', AController(LoadingAnimationController)])
.directive('loadingAnimation', [function() {
	return {
		restrict: 'E',
		transclude: false,
		scope: {
		},
		template: require('./loading-animation.pug')(),
		controller: 'LoadingAnimationController',
		controllerAs: 'ctrl'
	};
}]);
