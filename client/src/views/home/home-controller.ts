

interface IHomeControllerScope extends ng.IScope {
	ctrl: AppHomeViewController;
}

class AppHomeViewController {

	constructor(
		private $scope: IHomeControllerScope) {

	}

}

angular.module('AppPlatform.views.home')
	.controller('AppHomeViewController', [
		'$scope',
		'$rootScope',
		AController(AppHomeViewController)
	]);
