'use strict';

angular.module('bahmni.admin')
    .controller('ConfigEditorController', ['$scope', 'configNameInit', 'appNameInit', 'appConfigService',
        function ($scope, configNameInit, appNameInit, appConfigService) {
            appConfigService.getAppConfig(appNameInit, configNameInit).then(function (response) {
                $scope.appConfig = response.data;
                var config = response.data.config;
                config = config.slice(1, config.length - 1);
                config = config.replace(/\\n/g, " ");
                config = config.replace(/\\"/g, "\"");
                $scope.config = config;
            });

            $scope.save = function () {
                $scope.appConfig.config = JSON.stringify($scope.config);
                appConfigService.save($scope.appConfig);
            };

        }]);