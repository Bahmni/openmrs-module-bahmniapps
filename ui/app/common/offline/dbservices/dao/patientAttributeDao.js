'use strict';

angular.module('bahmni.common.offline')
    .service('patientAttributeDao', ['$http', function ($http) {
        var insertAttributeTypes = function (db) {
            $http.get(window.location.origin + "/openmrs/ws/rest/v1/personattributetype?v=custom:(name,uuid,format)").then(function (attributesResponse) {
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
                tx.exec(queries);
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
                                'uuid': personAttribute.uuid
                            });
                            queries.push(db.insertOrReplace().into(attributeTable).values([row]));
                        }
                    }
                }
            }
            var tx = db.createTransaction();
            tx.exec(queries);
        };


        return {
            insertAttributeTypes: insertAttributeTypes,
            insertAttributes: insertAttributes
        }

    }]);