
interface IConversionResource {
	convert(delta: Object, success?: Function, error?: (err) => any);
	getFiles(callback: (files?: Array<any>) => void): Array<any>;
	downloadFile(selector: any, cb?: any): any;
}

angular.module('AppPlatform.services.conversion', [])
	.factory('ConversionResource', ['$resource', '$http', function($resource: angular.resource.IResourceService, $http: angular.IHttpService): IConversionResource {
		var res: any = $resource('/api/conversion', { 'id': '@_id', 'type': '@type' }, {
			'convert': {
				method: 'PUT',
				url: '/api/conversion'
			},
			'getFiles': {
				method: 'GET',
				url: '/api/conversion'
			},
			'downloadFile': {
				method: 'GET',
				url: '/api/conversion/:type/:id/download',
				params: { id: '@_id', type: '@type' },
			},
		});

		return <IConversionResource>res;
	}]);
