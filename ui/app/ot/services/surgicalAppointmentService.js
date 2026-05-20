'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentService', ['$http', 'appService', function ($http, appService) {
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
                params: {v: "custom:(uuid,name,format)"},
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

        this.getSurgicalBlocksInDateRange = function (startDatetime, endDatetime, includeVoided, activeBlocks) {
            var additionalCustomParam = appService.getAppDescriptor().getConfigValue("additionalCustomParam");
            return $http.get(Bahmni.OT.Constants.addSurgicalBlockUrl, {
                method: "GET",
                params: {
                    startDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDatetime),
                    endDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDatetime),
                    includeVoided: includeVoided || false,
                    activeBlocks: activeBlocks || false,
                    v: "custom:(id,uuid," +
                    "provider:(uuid,person:(uuid,display),attributes:(attributeType:(display),value,voided))," +
                    "location:(uuid,name),startDatetime,endDatetime,surgicalAppointments:(id,uuid,patient:(uuid,display,person:(age,gender,birthdate))," +
                    "actualStartDatetime,actualEndDatetime,status,notes,sortWeight,bedNumber,bedLocation,surgicalAppointmentAttributes" +
                    (additionalCustomParam ? "," + additionalCustomParam : "") + "))"
                },
                withCredentials: true
            });
        };

        this.getPrimaryDiagnosisConfigForOT = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'obs.conceptMappingsForOT'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            });
        };
        this.getBulkNotes = function (startDate, endDate) {
            return $http.get(Bahmni.OT.Constants.notesUrl, {
                method: 'GET',
                params: {
                    noteType: 'OT Module',
                    noteStartDate: startDate,
                    noteEndDate: endDate
                },
                withCredentials: true
            });
        };
        var constructPayload = function (noteDate, note, noteEndDate) {
            const payload = [];
            const currentDate = new Date(noteDate);
            // eslint-disable-next-line no-unmodified-loop-condition
            while (currentDate <= noteEndDate) {
                payload.push({
                    noteTypeName: "OT module",
                    noteDate: new Date(currentDate),
                    noteText: note
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return payload;
        };

        this.saveNoteForADay = function (noteDate, note, noteEndDate) {
            const payload = noteEndDate != null ? constructPayload(noteDate, note, noteEndDate) : [{
                noteTypeName: "OT module",
                noteDate: noteDate,
                noteText: note
            }];
            const headers = {"Accept": "application/json", "Content-Type": "application/json"};
            return $http.post(Bahmni.OT.Constants.notesUrl, payload, headers);
        };

        this.updateNoteForADay = function (noteId, note, providerUuid) {
            const payload = {
                providerUuid: providerUuid,
                noteText: note
            };
            const headers = {"Accept": "application/json", "Content-Type": "application/json"};
            return $http.post(Bahmni.OT.Constants.notesUrl + "/" + noteId, payload, headers);
        };

        this.deleteNoteForADay = function (noteId) {
            const headers = {"Accept": "application/json", "Content-Type": "application/json", withCredentials: true};
            return $http.delete(Bahmni.OT.Constants.notesUrl + "/" + noteId, headers);
        };
    }]);
