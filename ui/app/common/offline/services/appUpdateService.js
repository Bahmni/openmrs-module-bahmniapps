'use strict';

angular.module('bahmni.common.offline')
    .service('appUpdateService', ['$http', 'appInfoStrategy', '$q', function ($http, appInfoStrategy, $q) {
        var isForcedUpdateRequired = function (metadataInfo) {
            var installedVersion = appInfoStrategy.getVersion();
            var forcedUpdateRequired = false;
            var latestVersion = _.max(metadataInfo.compatibleVersions);

            if (latestVersion > installedVersion) {
                metadataInfo.compatibleVersions.map(function (version) {
                    return Number(version);
                });
                forcedUpdateRequired = metadataInfo.compatibleVersions.indexOf(Number(installedVersion)) === -1;
            }
            return forcedUpdateRequired;
        };

        var getUpdateInfo = function () {
            var appUpdateInfo = localStorage.getItem("appUpdateInfo");
            appUpdateInfo = appUpdateInfo ? JSON.parse(appUpdateInfo) : appUpdateInfo;
            if (appUpdateInfo) {
                appUpdateInfo.forcedUpdateRequired = isForcedUpdateRequired(appUpdateInfo);
            }

            var config = {
                headers: {
                    'If-None-Match': appUpdateInfo ? appUpdateInfo.etag : undefined
                }
            };
            var deferred = $q.defer();

            $http.get(Bahmni.Common.Constants.offlineMetadataUrl, config).then(function (response) {
                if (response.status === 200) {
                    var metadataInfo = response.data;
                    appUpdateInfo = {
                        latestAndroidAppUrl: metadataInfo.latestAndroidAppUrl,
                        latestChromeAppUrl: metadataInfo.latestChromeAppUrl,
                        compatibleVersions: metadataInfo.compatibleVersions,
                        etag: response.headers().etag
                    };
                    localStorage.setItem("appUpdateInfo", JSON.stringify(appUpdateInfo));
                    appUpdateInfo.forcedUpdateRequired = isForcedUpdateRequired(appUpdateInfo);
                }
                deferred.resolve(appUpdateInfo);
            }).catch(function (response) {
                if (response.status === 304) {
                    deferred.resolve(appUpdateInfo);
                } else if (response.status === 404) {
                    localStorage.removeItem("appUpdateInfo");
                    deferred.resolve({});
                } else {
                    deferred.reject(response);
                }
            });
            return deferred.promise;
        };

        return {
            getUpdateInfo: getUpdateInfo
        };
    }]);
