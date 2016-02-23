'use strict';

angular.module('bahmni.common.offline')
    .service('referenceDataDbService',['patientAttributeDbService', 'locationDbService',
        function (patientAttributeDbService, locationDbService) {

        var db;

        var getReferenceData = function (referenceDataKey) {
            var referenceData = db.getSchema().table('reference_data');
            return db.select()
                .from(referenceData)
                .where(referenceData.key.eq(referenceDataKey)).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var insertReferenceData = function(referenceDataKey, data, eTag){
            var referenceData = db.getSchema().table('reference_data');
            var promise;

            var row = referenceData.createRow({
                key: referenceDataKey,
                value: data,
                etag: eTag
            });

            return db.insertOrReplace().into(referenceData).values([row]).exec().then(function () {
                switch (referenceDataKey) {
                    case 'PersonAttributeType':
                        promise = patientAttributeDbService.insertAttributeTypes(db, data.results);
                        break;
                    case 'LoginLocations':
                        promise = locationDbService.insertLocations(db, data.results);
                        break;
                    default :
                        return getReferenceData(referenceDataKey);
                        break;
                }
                return promise.then(function(){
                    return  getReferenceData(referenceDataKey);
                })
            });
        };

        var init = function (_db) {
            db = _db;
        };


        return {
            init: init,
            getReferenceData: getReferenceData,
            insertReferenceData: insertReferenceData
        }
    }]);