

interface IAppRootScope extends angular.IRootScopeService {
	$state: angular.ui.IStateService;
	$stateParams: any;
}

angular.module('AppPlatform', [
	// angular related
	'ngResource',
	'ui.router',
	'ngSanitize',
	'ui.bootstrap',
	// views
	'AppPlatform.views.home',
	// services
	// widgets
	'AppPlatform.widgets.loadingAnimation',
])
	.run(['$rootScope', '$q', '$state', '$stateParams', '$window', '$location', '$timeout', function($rootScope: IAppRootScope, $q, $state, $stateParams, $window, $location, $timeout) {

		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;


		$rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
			$state.go('home'); /// Fallback
		});

	}])
	.config(['$urlRouterProvider', function($urlRouterProvider) {
		$urlRouterProvider.when('', 'home');
		$urlRouterProvider.when('/', 'home');

		$urlRouterProvider.otherwise(($injector, $location) => {
			var wrongUrl = $location.$$url;
			console.error('Could not resolve state / URL for', wrongUrl);
			return '/';
		});

	}]);
