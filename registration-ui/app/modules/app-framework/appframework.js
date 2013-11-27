'use strict';

angular.module('appFramework', ['authentication'])
    .service('appService', ['$http', '$q', 'sessionService','$rootScope', function ($http, $q, sessionService, $rootScope) {
        var appExtensions = null;
        var currentUser = null;
        var baseUrl = "/bahmni_config/openmrs/apps/";
        var appDescriptor = null;


        var loadConfig = function(url) {
            return $http.get(url, {withCredentials: true});
        };

        var loadTemplate = function(appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.name + "/appTemplate.json").success(function(results) {
                if (results.length > 0) {
                    appDescriptor.setTemplate(results[0]);
                }
                deferrable.resolve(appDescriptor);
            })
            .error(function(error) {
                deferrable.reject();
            });
            return deferrable.promise;
        };

        var loadDefinition = function(appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.name + "/app.json").success(function(results) {
                if (results.length > 0) {
                    appDescriptor.setDefinition(results[0]);
                }
                deferrable.resolve(appDescriptor);
            }).error(function(error) {
                deferrable.reject();
            });
            return deferrable.promise;
        };

        var loadExtensions = function(appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.name + "/extension.json").success(function(result) {
                    appDescriptor.setExtensions(result);
                    deferrable.resolve(appDescriptor);
            }).error(function(error) {
                    deferrable.reject(error);
            });
            return deferrable.promise;
        };

        var loadAppExtensions = function (appName) {
            var deferrable = $q.defer();
            var appExtnUrl = baseUrl + appName + "/extension.json";
            loadConfig(appExtnUrl).success(function (data) {
                deferrable.resolve(data);
            }).error(function () {
                    deferrable.reject('Could not get app extensions for ' + appName);
                });
            return deferrable.promise;
        };

        this.getAppDescriptor = function() {
            return appDescriptor;
        };

        this.initApp = function(appName, options) {
            var appLoader = $q.defer();
            var promises = [];

            var opts = options || [];
            var tmpl = opts.indexOf("template") > -1;
            var defn = opts.indexOf("app") > -1;

            appDescriptor = new AppDescriptor(appName, function() {
                return currentUser;
            });

            promises.push(sessionService.loadCredentials());
            promises.push(loadExtensions(appDescriptor));
            if (tmpl) {
                promises.push(loadTemplate(appDescriptor));
            }
            if (defn) {
                promises.push(loadDefinition(appDescriptor));
            }
            $q.all(promises).then(function (results) {
                currentUser = results[0];
                appLoader.resolve(appDescriptor);
                $rootScope.$broadcast('event:appExtensions-loaded');
            }, function(errors){
                appLoader.reject(errors);
            });
            return appLoader.promise;
        };
    }])
    .directive('extensionList', ['appService', function(appService) {
        var urlFormatter =  function (url, options) {
            console.log("inside formatUrl");

            var pattern = /{{([^}]*)}}/g;
            var matches = url.match(pattern);
            var replacedString = url;
            if (matches) {
                matches.forEach(function(el) {
                    var key = el.replace("{{",'').replace("}}",'');
                    var value = options[key];
                    if (value) {
                        replacedString = replacedString.replace(el, options[key]);
                    }
                });
            }
            return replacedString.trim();
        };

        return {
            restrict:'EA',
            template: '<li ng-repeat="appExtn in appExtensions"> <a href="{{formatUrl(appExtn.url, extnParams)}}" title="{{appExtn.label}}"></a></li>',
            scope: {
                extnId : '@',
                extnType: '@',
                onClick: '&',
                extnData: '='
            },
            compile: function(cElement, cAttrs) {
                var extnList = appService.allowedAppExtensions(cAttrs.extnId, cAttrs.extnType);
                return function(scope, lElement, attrs) {
                    scope.appExtensions = extnList;
                };
            },
            controller: function($scope) {
                $scope.formatUrl = urlFormatter;
            }
        };
    }]);


