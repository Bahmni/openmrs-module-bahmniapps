'use strict';

angular.module('bahmni.reports')
    .factory('reportService', ['$http', '$q', function ($http, $q) {
        var fire = function (report) {
            console.log(report);
            var deferred = $q.defer();
            $.ajax(
                {
                    url: Bahmni.Common.Constants.reportsUrl,
                    data: JSON.stringify(report),
                    type: 'post',
                    headers: {
                        "Content-Type": 'application/json',
                        "Accept": "application/vnd.ms-excel"
                    },
                    success: function (retData) {
                        $("body").append("<iframe src='" + retData.url + "' style='display: none;' ></iframe>");
                        deferred.promise.resolve();
                    }});
            return deferred.promise;
//            return $http.post(Bahmni.Common.Constants.reportsUrl, report, {
//                withCredentials: true,
//                headers: {"Accept": "application/vnd.ms-excel", "Content-Type": "application/json"}
//            });
        };

        return {
            fire: fire
        };

    }]);
