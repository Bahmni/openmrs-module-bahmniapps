'use strict';
angular.module('bahmni.common.logging')
    .service('auditLogService', ['$http', '$translate', 'appService', function ($http, $translate, appService) {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var convertToLocalDate = function (date) {
            var localDate = DateUtil.parseLongDateToServerFormat(date);
            return DateUtil.getDateTimeInSpecifiedFormat(localDate, 'MMMM Do, YYYY [at] h:mm:ss A');
        };

        this.getLogs = function (params) {
            params = params || {};
            return $http.get(Bahmni.Common.Constants.auditLogUrl, {params: params}).then(function (response) {
                return response.data.map(function (log) {
                    if (!appService.getAppDescriptor().getConfigValue('displayNepaliDates')) {
                        log.dateCreated = convertToLocalDate(log.dateCreated);
                    }
                    log.displayMessage = $translate.instant(log.message, log);
                    return log;
                });
            });
        };

        this.auditLog = function (params) {
            return $http.post(Bahmni.Common.Constants.auditLogUrl,
                       params,
                       {withCredentials: true}
            );
        };
    }]);
