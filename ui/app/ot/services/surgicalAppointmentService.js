'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentService', ['$http', function ($http) {
        this.getSurgeons = function () {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {v: "custom:(id,uuid,person:(uuid,display))"},
                withCredentials: true
            });
        };

        this.saveSurgicalBlock = function (data) {
            return $http.post(Bahmni.OT.Constants.addSurgicalBlockUrl, data, {
                params: {v: "full"},
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.getSurgicalAppointmentAttributeTypes = function () {
            return $http.get(Bahmni.OT.Constants.surgicalAppointmentAttributeTypeUrl, {
                method: "GET",
                params: {v: "custom:(uuid,name)"},
                withCredentials: true
            });
        };

        this.getSurgicalBlockFor = function (surgicalBlockUui) {
            return $http.get(Bahmni.OT.Constants.addSurgicalBlockUrl + "/" + surgicalBlockUui, {
                params: {v: "full"},
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };
        this.getSurgicalBlocksInDateRange = function (startDatetime, endDatetime) {
            return $http.get(Bahmni.OT.Constants.addSurgicalBlockUrl, {
                method: "GET",
                params: {startDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDatetime), endDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDatetime)},
                withCredentials: true
            });
        };
    }]);
