
class AppMainController {
	constructor(
		private $rootScope: IAppRootScope,
		private $scope: ng.IScope,
		private $state: ng.ui.IStateService
	) {
	}
}

angular.module('AppPlatform')
	.controller('AppCtrl', [
		'$rootScope',
		'$scope',
		'$state',
		AController(AppMainController)
	]);
