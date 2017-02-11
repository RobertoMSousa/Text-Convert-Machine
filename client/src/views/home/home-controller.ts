

interface IHomeControllerScope extends ng.IScope {
	ctrl: AppHomeViewController;
}

interface IConversionSocketEvent {
}

// interface of the file
interface IFile {
	_id: string;
	created: string;
	delta: any;
	documentId: string;
	status: string;
	title: string;
	type: string;
	url: string;
	version: number;
}

class AppHomeViewController {

	private listFiles: Array<IFile> = new Array();
	private conversionSocket: AppSocket;

	constructor(
		private $scope: IHomeControllerScope,
		private $state: angular.ui.IStateService,
		private ConversionResource: IConversionResource,
		private socket: AppSocketFactory,
		private $timeout: angular.ITimeoutService) {

		//get the orinal files from server
		this.getFilesFromServer();

		//start the socket connection and whatch on conversion done
		this.conversionSocket = socket.connect('conversion', {})
			.on('conversion:done', (doc: IFile) => {
				// on file convert load from server
				console.log('doc-->', doc);//roberto
				this.updateListFiles(doc);
				$('#alert_placeholder').html('<div class="alert alert-success fade in"><a ng-click="ctrl.closeAlert()" class="close" data-dismiss="alert">&times;</a>Your file ' + doc.title + ' is available for download!</div>')
				this.$timeout(() => {
					$('#alert_placeholder').remove();
				}, 4000);
			});

		// on scope destroy disconnect the  socket
		$scope.$on('$destroy', () => {
			// Disconnect from realtime server
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

	private updateListFiles(doc: IFile) {
		//find the position on the array with the doc id and change
		const indexChange = (this.listFiles.map(file => file._id).indexOf(doc._id));
		this.listFiles[indexChange].status = doc.status;
		this.listFiles[indexChange].url = doc.url;
		this.$scope.$apply();
		// update the scope
	}

}

angular.module('AppPlatform.views.home')
	.controller('AppHomeViewController', [
		'$scope',
		'$state',
		'ConversionResource',
		'socket',
		'$timeout',
		AController(AppHomeViewController)
	]);
