

interface IHomeControllerScope extends ng.IScope {
	ctrl: AppHomeViewController;
}

class AppHomeViewController {

	private listFiles: Array<any> = [{
		name: 'name',
		created: 'DD/MM/YYYY HH:MM:SS',
		type: 'type',
		processed: false
	},
	{
		name: 'name1',
		created: 'DD/MM/YYYY HH:MM:SS',
		type: 'type',
		processed: true
	},
	{
		name: 'name2',
		created: 'DD/MM/YYYY HH:MM:SS',
		type: 'type',
		processed: true
	},
	{
		name: 'name3',
		created: 'DD/MM/YYYY HH:MM:SS',
		type: 'type',
		processed: true
	},
	{
		name: 'name4',
		created: 'DD/MM/YYYY HH:MM:SS',
		type: 'type',
		processed: false
	},
	{
		name: 'name5',
		created: 'DD/MM/YYYY HH:MM:SS',
		type: 'type',
		processed: false
	}];
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
