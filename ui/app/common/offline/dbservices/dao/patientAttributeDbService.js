'use strict';

angular.module('bahmni.common.offline')
    .service('patientAttributeDbService', ['$http', function ($http) {
        var insertAttributeTypes = function (db) {
                return $http.get(window.location.origin + Bahmni.Common.Constants.RESTWS_V1 + "/personattributetype?v=custom:(name,uuid,format)").then(function (attributesResponse) {
                var personAttributeTypeList = attributesResponse.data.results;
                var table, queries = [];
                table = db.getSchema().table('patient_attribute_type');
                for (var i = 0; i < personAttributeTypeList.length; i++) {
                    var row = table.createRow({
                        'attributeTypeId': i,
                        'uuid': personAttributeTypeList[i].uuid,
                        'attributeName': personAttributeTypeList[i].name,
                        'format': personAttributeTypeList[i].format
                    });
                    queries.push(db.insertOrReplace().into(table).values([row]));
                }
                var tx = db.createTransaction();
                return tx.exec(queries);
            });
        };

        var insertAttributes = function (db, patientUuid, attributes, attributeTypeMap) {
            var attributeTable, value;
            attributeTable = db.getSchema().table('patient_attribute');
            var queries = [];
            if (attributes != null && attributes.length > 0) {
                for (var j = 0; j < attributes.length; j++) {
                    if (!attributes[j].voided) {
                        var personAttribute = attributes[j];
                        var attributeValue = personAttribute.value;
                        if (typeof(attributeValue) == "object") {
                            value = attributeValue.display;
                        } else
                            value = attributeValue;
                        var foundAttribute = _.find(attributeTypeMap, function (attributeType) {
                            return attributeType.uuid === personAttribute.attributeType.uuid
                        });
                        if (foundAttribute != undefined) {
                            var row = attributeTable.createRow({
                                'attributeTypeId': foundAttribute.attributeTypeId,
                                'attributeValue': value,
                                'patientUuid': patientUuid,
                                'uuid': personAttribute.uuid ? personAttribute.uuid : Bahmni.Common.Offline.UUID.generateUuid()
                            });
                            queries.push(db.insertOrReplace().into(attributeTable).values([row]));
                        }
                    }
                }
                var tx = db.createTransaction();
                return tx.exec(queries);
            }
        };


        return {
            insertAttributeTypes: insertAttributeTypes,
            insertAttributes: insertAttributes
        }

    }]);