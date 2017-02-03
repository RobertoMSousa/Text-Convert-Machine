
angular.module('AppPlatform.views.create', [
	'ui.router',
	'ui.bootstrap'
])
	.config(['$stateProvider', function($stateProvider: angular.ui.IStateProvider) {
		$stateProvider.state('create', {
			url: '/create',
			template: require('./create.pug')(),
			controller: 'AppCreateViewController',
			controllerAs: 'ctrl'
		});
	}]);
