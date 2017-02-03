

interface ICreateControllerScope extends ng.IScope {
	ctrl: AppCreateViewController;
}

class AppCreateViewController {
	constructor(
		private $scope: ICreateControllerScope,
		private $state: angular.ui.IStateService) {
	}

}

angular.module('AppPlatform.views.create')
	.controller('AppCreateViewController', [
		'$scope',
		'$state',
		AController(AppCreateViewController)
	]);
