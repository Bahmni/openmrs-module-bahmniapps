'use strict';

angular.module('bahmni.clinical')
    .factory('autoSaveService', ['$interval', 'appService', function ($interval, appService) {
        var autoSaveIntervalPromise = null;

        var getAutoSaveIntervalMs = function () {
            var seconds = appService.getAppDescriptor().getConfigValue('autoSaveIntervalSeconds');
            if (!seconds || isNaN(seconds) || seconds <= 0) {
                return Bahmni.Clinical.Constants.autoSaveIntervalMs;
            }
            return seconds * 1000;
        };

        var start = function (shouldSaveFn, saveFormDraftFn) {
            if (autoSaveIntervalPromise) {
                return;
            }
            var intervalMs = getAutoSaveIntervalMs();
            autoSaveIntervalPromise = $interval(function () {
                if (shouldSaveFn()) {
                    saveFormDraftFn();
                }
            }, intervalMs);
        };

        var stop = function () {
            if (autoSaveIntervalPromise) {
                $interval.cancel(autoSaveIntervalPromise);
                autoSaveIntervalPromise = null;
            }
        };

        return {
            start: start,
            stop: stop,
            getIntervalMs: getAutoSaveIntervalMs
        };
    }]);

