'use strict';

angular.module('bahmnihome')
    .controller('DashboardController', ['$scope', '$location', 'appService', '$q', 'sessionService', 'spinner', '$window', function ($scope, $location, appService, $q, sessionService, spinner, $window) {
        $scope.openApp = function (appName) {
            $window.location = "/" + appName;
        }

        $scope.appExtensions = [];

        var loadAppExtensions = function() {
            return appService.loadAppExtensions('home');
        }

        var initialize = function() {
             var deferrable = $q.defer();
             sessionService.loadCredentials().then(loadAppExtensions).then(
                 function() {
                     deferrable.resolve();
                 },
                 function() {
                     deferrable.reject();
                 }
             );
             return deferrable.promise;
        };

        spinner.forPromise(initialize()).then(
            function() {
                $scope.appExtensions = appService.allowedApps("org.bahmni.home.dashboard");
            }
        );

    }])
    .directive('btnUserInfo', ['$rootScope', '$window', function($rootScope, $window) {
        return {
            restrict: 'CA',
            link: function(scope, elem, attrs) {
                elem.bind('click', function(event) {
                    $(this).next().toggleClass('active');
                    event.stopPropagation();
                });
                $(document).find('html').bind('click', function() {
                    $(elem).next().removeClass('active');
                });
            }
        };
      }
    ]);
