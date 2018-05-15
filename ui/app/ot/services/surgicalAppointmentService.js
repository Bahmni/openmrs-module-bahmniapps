'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentService', ['$http', function ($http) {
        this.getSurgeons = function () {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {v: "custom:(id,uuid,person:(uuid,display),attributes:(attributeType:(display),value))"},
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

        this.updateSurgicalBlock = function (data) {
            return $http.post(Bahmni.OT.Constants.addSurgicalBlockUrl + '/' + data.uuid, data, {
                params: {v: "full"},
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.updateSurgicalAppointment = function (data) {
            return $http.post(Bahmni.OT.Constants.updateSurgicalAppointmentUrl + "/" + data.uuid, data, {
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

        this.getSurgicalBlockFor = function (surgicalBlockUuid) {
            return $http.get(Bahmni.OT.Constants.addSurgicalBlockUrl + "/" + surgicalBlockUuid, {
                params: {v: "full"},
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.getSurgicalBlocksInDateRange = function (startDatetime, endDatetime, includeVoided) {
            return $http.get(Bahmni.OT.Constants.addSurgicalBlockUrl, {
                method: "GET",
                params: {
                    startDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDatetime),
                    endDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDatetime),
                    includeVoided: includeVoided || false,
                    v: "custom:(id,uuid," +
                    "provider:(uuid,person:(uuid,display),attributes:(attributeType:(display),value,voided))," +
                    "location:(uuid,name),startDatetime,endDatetime,surgicalAppointments:(id,uuid,patient:(uuid,display,person:(age))," +
                    "actualStartDatetime,actualEndDatetime,status,notes,sortWeight,bedNumber,bedLocation,surgicalAppointmentAttributes))"
                },
                withCredentials: true
            });
        };
    }]);
