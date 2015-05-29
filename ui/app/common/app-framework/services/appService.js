'use strict';

angular.module('bahmni.common.appFramework')
    .service('appService', ['$http', '$q', 'sessionService', '$rootScope', function ($http, $q, sessionService, $rootScope) {
        var currentUser = null;
        var baseUrl = "/bahmni_config/openmrs/apps/";
        var appDescriptor = null;
        var self = this;

        var loadConfig = function (url) {
            return $http.get(url, {withCredentials: true});
        };

        var loadTemplate = function (appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.contextPath + "/appTemplate.json").then(
                function (result) {
                    if (result.data.length > 0) {
                        appDescriptor.setTemplate(result.data[0]);
                    }
                    deferrable.resolve(appDescriptor);
                },
                function (error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };

        var loadDefinition = function (appDescriptor) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.contextPath + "/app.json").then(
                function (result) {
                    if (result.data.length > 0) {
                        appDescriptor.setDefinition(result.data[0]);
                    }
                    deferrable.resolve(appDescriptor);
                },
                function (error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };

        var loadExtensions = function (appDescriptor, extensionFileName) {
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.extensionPath + extensionFileName).then(
                function (result) {
                    appDescriptor.setExtensions(result.data);
                    deferrable.resolve(appDescriptor);
                },
                function (error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };

        var loadPageConfig = function(pageName,appDescriptor){
            var deferrable = $q.defer();
            loadConfig(baseUrl + appDescriptor.contextPath + "/"+pageName+".json").then(
                function (result) {
                    if (result.data.length > 0) {
                        appDescriptor.addConfigForPage(pageName,result.data);
                    }
                    deferrable.resolve(appDescriptor);
                },
                function (error) {
                    if (error.status != 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
            return deferrable.promise;
        };
        this.getAppDescriptor = function () {
            return appDescriptor;
        };

        this.configBaseUrl =  function () {
            return baseUrl;
        };

        this.loadConfig = function (name) {
            return loadConfig(baseUrl + appDescriptor.contextPath + "/" + name);
        };

        this.loadMandatoryConfig = function(path) {
            return $http.get(path);
        };

        this.initApp = function (appName, options, extensionFileSuffix, configPages) {
            var appLoader = $q.defer();
            var extensionFileName = extensionFileSuffix ? "/extension-" + extensionFileSuffix + ".json" : "/extension.json";
            var promises = [];
            var opts = options || {'app': true, 'extension': true};

            var inheritAppContext = (opts.inherit == undefined) ? true : opts.inherit;

            appDescriptor = new Bahmni.Common.AppFramework.AppDescriptor(appName, inheritAppContext, function () {
                return currentUser;
            });

            var loadCredentialsPromise = sessionService.loadCredentials();
            var loadProviderPromise = loadCredentialsPromise.then(sessionService.loadProviders);

            promises.push(loadCredentialsPromise);
            promises.push(loadProviderPromise);
            if (opts.extension) {
                promises.push(loadExtensions(appDescriptor, extensionFileName));
            }
            if (opts.template) {
                promises.push(loadTemplate(appDescriptor));
            }
            if (opts.app) {
                promises.push(loadDefinition(appDescriptor));
            }
            if(!_.isEmpty(configPages)){
                configPages.forEach(function(configPage){
                    promises.push(loadPageConfig(configPage,appDescriptor));
                });
            }
            $q.all(promises).then(function (results) {
                currentUser = results[0];
                appLoader.resolve(appDescriptor);
                $rootScope.$broadcast('event:appExtensions-loaded');
            }, function (errors) {
                appLoader.reject(errors);
            });
            return appLoader.promise;
        };
    }]);