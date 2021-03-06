
interface IDocumentCreate {
	type: string;
	title: string;
	delta: any;
}

interface ICreateControllerScope extends ng.IScope {
	ctrl: AppCreateViewController;
}

class AppCreateViewController {

	private quill = new Quill('#editor-container', {
		modules: {
			toolbar: [
				[{ header: [1, 2, false] }],
				['bold', 'italic', 'underline'],
				['image', 'code-block']
			]
		},
		placeholder: 'Compose an epic...',
		theme: 'snow'
	});

	private title: string = 'untitled';

	private dropSelect: string = 'HTML';

	private convListTypes: Array<string> = ['HTML', 'PDF']

	constructor(
		private $scope: ICreateControllerScope,
		private $state: angular.ui.IStateService,
		private ConversionResource: IConversionResource) {
	}

	private setDropValue(value: string) {
		this.dropSelect = value;
	}

	private convertFile() {

		//build the file with the data that will be send to the server
		const localDoc: IDocumentCreate = {
			delta: this.quill.getContents(),
			title: this.title,
			type: this.dropSelect
		};

		// call the service that communicate with the api
		this.ConversionResource.convert(localDoc, () => {
			this.$state.go('home');
			return;
		},
			(error) => {
				console.error('err:', error);
				//show an alert box informing about the error
				return;
			});
	}

	private cancelConvertion() {
		// cancel and return to the home page
		this.$state.go('home');
	}

}

angular.module('AppPlatform.views.create')
	.controller('AppCreateViewController', [
		'$scope',
		'$state',
		'ConversionResource',
		AController(AppCreateViewController)
	]);
