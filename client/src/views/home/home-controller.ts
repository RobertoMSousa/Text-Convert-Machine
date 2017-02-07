

interface IHomeControllerScope extends ng.IScope {
	ctrl: AppHomeViewController;
}

class AppHomeViewController {

	private listFiles: Array<any> = [];
	constructor(
		private $scope: IHomeControllerScope,
		private $state: angular.ui.IStateService,
		private ConversionResource: IConversionResource) {
		this.getFilesFromServer();
	}

	private getFilesFromServer() {
		this.ConversionResource.getFiles((files: any) => {
			console.log('files-->', files);//roberto
			this.listFiles = files.files;
		});
	}

	private goToCreate() {
		this.$state.go('create');
	}

	private downloadfile(doc) {
		console.log('doc-->', doc);//roberto
		this.ConversionResource.downloadFile({ id: doc._id, type: doc.type }, (err: any) => {
		});
	}

}

angular.module('AppPlatform.views.home')
	.controller('AppHomeViewController', [
		'$scope',
		'$state',
		'ConversionResource',
		AController(AppHomeViewController)
	]);
