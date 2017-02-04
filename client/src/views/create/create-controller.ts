
interface ICreateControllerScope extends ng.IScope {
	ctrl: AppCreateViewController;
}

class AppCreateViewController {

	constructor(
		private $scope: ICreateControllerScope,
		private $state: angular.ui.IStateService) {
		var quill = new Quill('#editor-container', {
			modules: {
				toolbar: [
					[{ header: [1, 2, false] }],
					['bold', 'italic', 'underline'],
					['image', 'code-block']
				]
			},
			placeholder: 'Compose an epic...',
			theme: 'snow'  // or 'bubble'
		});
	}

	private convertFile() {
		this.$state.go('create');
	}

	private cancelConvertion() {
		this.$state.go('home');
	}

}

angular.module('AppPlatform.views.create')
	.controller('AppCreateViewController', [
		'$scope',
		'$state',
		AController(AppCreateViewController)
	]);
