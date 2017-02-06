
interface IConversionResource {
	convert(delta: Object, success?: Function, error?: (err) => any);
	getFiles(callback: (files?: Array<any>) => void): Array<any>;
}

angular.module('AppPlatform.services.conversion', [])
	.factory('ConversionResource', ['$resource', '$http', function($resource: angular.resource.IResourceService, $http: angular.IHttpService): IConversionResource {
		var res: any = $resource('/api/conversion', {}, {
			'convert': {
				method: 'PUT',
				url: '/api/conversion'
			},
			'getFiles': {
				method: 'GET',
				url: '/api/conversion'
			},
		});

		return <IConversionResource>res;
	}]);
