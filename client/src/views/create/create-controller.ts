
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

	constructor(
		private $scope: ICreateControllerScope,
		private $state: angular.ui.IStateService) {
	}

	private convertFile() {
		// get the delta content of a file and send it to the server
		console.log('delta-->', this.quill.getContents());//roberto
		// this.$state.go('home');
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
		AController(AppCreateViewController)
	]);
