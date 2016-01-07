'use strict';

angular.module('bahmni.registration')
    .factory('patientServiceOffline', ['$http', '$q', 'offlineService', 'chromeAppDataService', function ($http, $q, offlineService,chromeAppDataService) {

        var createSql = function(params){
            var nameParts = null;
            if (params.q) {
                nameParts = params.q.split(" ");
            }

            var attributeNames = "";
            if (params.patientAttributes) {
                attributeNames = "'" + params.patientAttributes.join("','") + "'";
            }

            var addressFieldName = null;
            if (params.address_field_name) {
                addressFieldName = params.address_field_name.replace("_", "");
            }

            var sqlString = "SELECT identifier, givenName, middleName, familyName, dateCreated, age, gender, uuid, " + addressFieldName +" as addressFieldValue "  +
                ", '{' || group_concat(DISTINCT (coalesce('\"' || pat.attributeName ||'\":\"' || pa1.attributeValue || '\"' , null))) || '}' as customAttribute" +
                "  from patient p " +
                " join patient_address padd " +
                " on p._id = padd.patientId" +
                " left outer join patient_attributes pa on p._id = pa.patientId" +
                " and pa.attributeTypeId in (" +
                "select "+ "attributeTypeId from patient_attribute_types" +
                " where attributeName in (" + attributeNames + "))" +
                " left outer join "+ "patient_attributes pa1 on " +
                " pa1.patientId = p._id" +
                " left outer join patient_attribute_types" +
                " pat on pa1.attributeTypeId = pat.attributeTypeId and pat.attributeName in (" + attributeNames + ")";
            var appender = " WHERE ";

            if (!_.isEmpty(params.address_field_value)) {
                sqlString += appender + "(padd." + addressFieldName + " LIKE '%" + params.address_field_value + "%') ";
                appender = " AND ";
            }
            if (!_.isEmpty(params.custom_attribute)) {
                sqlString += appender + "pa.attributeValue LIKE '%" + params.custom_attribute + "%'";
                appender = " AND ";

            }
            if (!_.isEmpty(params.identifier)) {
                sqlString += appender + " ( p.identifier = '" + params.identifier + "')";
                appender = " AND ";
            }
            if(!_.isEmpty(nameParts)){
                sqlString += appender + getNameSearchCondition(nameParts);
            }
            sqlString += " GROUP BY identifier ORDER BY dateCreated DESC LIMIT 50 OFFSET " + params.startIndex;
            return sqlString;
        };

        var getNameSearchCondition = function(nameParts) {
            var BY_NAME_PARTS = " (coalesce(givenName" +
                ", '') || coalesce(middleName" +
                ", '') || coalesce(familyName, '')) like ";
            if (nameParts.length == 0)
                return "";
            else {
                var queryByNameParts = "";
                angular.forEach(nameParts, function(part) {
                    if (!_.isEmpty(queryByNameParts)) {
                        queryByNameParts += " and " + BY_NAME_PARTS + " '%" + part + "%'";
                    } else {
                        queryByNameParts += BY_NAME_PARTS + " '%" + part + "%'";
                    }
                });
                return queryByNameParts;
            }
        };

        var search = function (params) {
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                var returnValue = JSON.parse(Android.search(createSql(params)));
                return $q.when(returnValue);
            }
            else {
                return chromeAppDataService.search(params);
            }
        };

        var get = function (uuid) {
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                return $q.when(JSON.parse(Android.getPatient(uuid)));
            }
            else{
                return chromeAppDataService.getPatient(uuid);
            }
        };

        var create = function(postRequest){
            postRequest.patient.person.auditInfo = {dateCreated: new Date()};
            if(postRequest.patient.identifiers)
                postRequest.patient.uuid = postRequest.patient.identifiers[0].identifier;
            postRequest.patient.person.preferredName = postRequest.patient.person.names[0];
            postRequest.patient.person.preferredAddress = postRequest.patient.person.addresses[0];
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
            }
            else{
                return chromeAppDataService.createPatient(postRequest);
            }
        };


        return {
            search: search,
            get: get,
            create : create
        };
    }]);
