'use strict';
angular
    .module('orders', ['ui.router', 'bahmni.orders', 'bahmni.common.domain', 'bahmni.common.patient', 'authentication', 'bahmni.common.config', 'bahmni.common.appFramework',
        'httpErrorInterceptor', 'bahmni.common.routeErrorHandler', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.util', 'bahmni.common.conceptSet',
        'RecursionHelper', 'infinite-scroll', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.obs', 'bahmni.common.displaycontrol.orders', 'bahmni.common.i18n',
        'bahmni.common.displaycontrol.observation', 'bahmni.common.orders', 'pascalprecht.translate', 'ngCookies', 'bahmni.common.uicontrols', 'bahmni.common.logging',
        'bahmni.common.gallery'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
            $urlRouterProvider.otherwise('/search');
            var homeBacklink = {label: "Home", url: "../home/", accessKey: "h", icon: "fa-home"};
            var searchBacklink = {label: "Search", state: "search", accessKey: "p", icon: "fa-users"};

        // @if DEBUG='production'
            $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
            $compileProvider.debugInfoEnabled(true);
        // @endif

            $stateProvider
            .state('search', {
                url: '/search',
                data: {
                    extensionPointId: 'org.bahmni.orders.search',
                    backLinks: [homeBacklink]
                },
                views: {
                    'content': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController'
                    }
                },
                resolve: { initialization: 'initialization' }
            })
            .state('orderFulfillment', {
                url: '/patient/:patientUuid/fulfillment/:orderType',
                data: {
                    backLinks: [homeBacklink, searchBacklink]
                },
                views: {
                    'additional-header': {
                        templateUrl: 'views/header.html',
                        controller: function ($scope, $rootScope, patientContext) {
                            $scope.patient = patientContext.patient;
                            $scope.save = function () {
                                $rootScope.$broadcast("event:saveOrderObservations");
                            };
                        }
                    },
                    'content': {
                        templateUrl: 'views/orderFulfillment.html',
                        controller: 'OrderFulfillmentController',
                        resolve: {
                            orderFulfillmentConfig: function (orderFulfillmentConfig, $stateParams) {
                                var formName = $stateParams.orderType + Bahmni.Common.Constants.fulfillmentFormSuffix;
                                return orderFulfillmentConfig(formName);
                            }
                        }
                    }
                },
                resolve: {
                    initialization: 'initialization',
                    patientContext: function (initialization, patientInitialization, $stateParams) {
                        return patientInitialization($stateParams.patientUuid);
                    }
                }
            });
            $bahmniTranslateProvider.init({app: 'orders', shouldMerge: true});
        }]

).run(['backlinkService', function (backlinkService) {
    moment.locale(window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
    backlinkService.addUrl({label: "Patient Search", url: "../home/"});
}]);

