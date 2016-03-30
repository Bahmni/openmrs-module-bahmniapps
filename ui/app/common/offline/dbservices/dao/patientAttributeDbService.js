'use strict';

angular.module('bahmni.common.offline')
    .service('patientAttributeDbService', [ function () {
        var insertAttributeTypes = function (db, personAttributeTypeList) {
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
        };

        var insertAttributes = function (db, patientUuid, attributes) {
            var attributeTable, value;
            attributeTable = db.getSchema().table('patient_attribute');
            var queries = [];
            return getAttributeTypes(db).then(function (attributeTypes) {
                if (attributes != null && attributes.length > 0) {
                    for (var j = 0; j < attributes.length; j++) {
                        if (!attributes[j].voided) {
                            var personAttribute = attributes[j];
                            var attributeValue = personAttribute.value;
                            if (typeof(attributeValue) == "object") {
                                value = attributeValue.display;
                            } else {
                                value = attributeValue;
                            }
                            var foundAttribute = _.find(attributeTypes, function (attributeType) {
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
            });
        };

        var getAttributeTypes = function (db) {
            var attributeTypeTable = db.getSchema().table('patient_attribute_type');

            return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec()
                .then(function (attributeTypeMap) {
                    return attributeTypeMap;
                });

        };


        return {
            insertAttributeTypes: insertAttributeTypes,
            insertAttributes: insertAttributes,
            getAttributeTypes: getAttributeTypes
        }

    }]);