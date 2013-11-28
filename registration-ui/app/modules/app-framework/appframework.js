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
            loadConfig(baseUrl + appDescriptor.contextPath + "/appTemplate.json").then(
                function(result) {
                    if (result.data.length > 0) {
                        appDescriptor.setTemplate(result.data[0]);
                    }
                    deferrable.resolve(appDescriptor);
                },
                function(error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };

        var loadDefinition = function(appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.contextPath + "/app.json").then(
                function(result) {
                    if (result.data.length > 0) {
                        appDescriptor.setDefinition(result.data[0]);
                    }
                    deferrable.resolve(appDescriptor);
                },
                function(error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };

        var loadExtensions = function(appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.extensionPath + "/extension.json").then(
                function(result) {
                    appDescriptor.setExtensions(result.data);
                    deferrable.resolve(appDescriptor);
                },
                function(error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };

        this.getAppDescriptor = function() {
            return appDescriptor;
        };

        this.initApp = function(appName, options) {
            var appLoader = $q.defer();
            var promises = [];
            var opts = options || {'app': true, 'extension' : true};

            var inheritAppContext = (opts.inherit == undefined) ? true : opts.inherit;

            appDescriptor = new AppDescriptor(appName, inheritAppContext, function() {
                return currentUser;
            });

            promises.push(sessionService.loadCredentials());
            if (opts.extension) {
                promises.push(loadExtensions(appDescriptor));
            }
            if (opts.template) {
                promises.push(loadTemplate(appDescriptor));
            }
            if (opts.app) {
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


