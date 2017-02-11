

interface IHomeControllerScope extends ng.IScope {
	ctrl: AppHomeViewController;
}

interface IConversionSocketEvent {
}

class AppHomeViewController {

	private listFiles: Array<any> = [];
	private conversionSocket: AppSocket;

	constructor(
		private $scope: IHomeControllerScope,
		private $state: angular.ui.IStateService,
		private ConversionResource: IConversionResource,
		private socket: AppSocketFactory) {

		//get the orinal files from server
		this.getFilesFromServer();

		//start the socket connection and whatch on conversion done
		this.conversionSocket = socket.connect('conversion', {})
			.on('connect', (a: IConversionSocketEvent) => {
				console.log('on socket connect');//roberto
				console.log('this.conversionSocket-->', this.conversionSocket._socket.id);//roberto
			})
			.on('conversion:done', (doc: any) => {
				console.log('event on conversion done-->', doc);//roberto
			});

		// on scope destroy disconnect the  socket
		$scope.$on('$destroy', () => {
			// Disconnect from realtime server
			console.log('disconnect');//roberto
			this.conversionSocket.disconnect();
		});
	}

	private getFilesFromServer() {
		this.ConversionResource.getFiles((files: any) => {
			this.listFiles = files.files;
		});
	}

	private goToCreate() {
		this.$state.go('create');
	}

}

angular.module('AppPlatform.views.home')
	.controller('AppHomeViewController', [
		'$scope',
		'$state',
		'ConversionResource',
		'socket',
		AController(AppHomeViewController)
	]);
