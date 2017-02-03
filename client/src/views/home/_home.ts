
angular.module('App.views.home', [
	'ui.router'
])
	.config(['$stateProvider', function($stateProvider: angular.ui.IStateProvider) {
		$stateProvider.state('home', {
			url: '/home',
			template: require('./home.pug')(),
			controller: 'AppHomeViewController',
			controllerAs: 'ctrl'
		});
	}]);
