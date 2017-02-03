
angular.module('AppPlatform.views.home', [
	'ui.router',
	'ui.bootstrap'
])
	.config(['$stateProvider', function($stateProvider: angular.ui.IStateProvider) {
		$stateProvider.state('home', {
			url: '/home',
			template: require('./home.pug')(),
			controller: 'AppHomeViewController',
			controllerAs: 'ctrl'
		});
	}]);
