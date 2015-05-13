'use strict';
angular
    .module('orders', ['ui.router', 'bahmni.orders', 'bahmni.common.domain', 'bahmni.common.patient', 'authentication', 'bahmni.common.config', 'bahmni.common.appFramework', 
        'httpErrorInterceptor', 'bahmni.common.routeErrorHandler', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.util'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', function ($urlRouterProvider, $stateProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/search');
        $stateProvider
            .state('search', {
                url: '/search',
                data: {
                    extensionPointId: 'org.bahmni.orders.search',
                    backLinks: [
                        {label: "Home", url: "../home/", icon: "fa-home"}
                    ]
                },
                views: {
                    'layout': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController' 
                    }
                },
                resolve: { initialization: 'initialization' }
            });
}]).run(['backlinkService', function (backlinkService) {
    backlinkService.addUrl({label: "Patient Search", url: "../home/"});
}]);

