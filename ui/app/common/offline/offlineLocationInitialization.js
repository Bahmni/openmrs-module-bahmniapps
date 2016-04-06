'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineLocationInitialization', ['offlineService','offlineDbService', 'androidDbService', 'eventLogService', '$q',
        function (offlineService, offlineDbService, androidDbService, eventLogService, $q) {
            return function () {
                var addressLevels;
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                var loginLocation = offlineService.getItem('LoginInformation').currentLocation;
                var deferred = $q.defer();

                offlineDbService.getReferenceData('AddressHierarchyLevels').then(function (addressHierarchyLevel) {
                    addressLevels = _.reverse(addressHierarchyLevel.value);
                    var addressField = getLoginLocationAddress();
                    _.reverse(addressLevels);
                    var params = { searchString: loginLocation[addressField], addressField: addressField};
                    if(params.searchString != undefined && params.addressField != undefined) {
                        eventLogService.getAddressForLoginLocation(params).then(function (results) {
                            var data = results.data;
                            for (var addressResults = 0; addressResults < data.length; addressResults++) {
                                var loginAddress = data[addressResults];
                                if (checkParents(loginAddress, getParentAddressLevel(addressField))) {
                                    offlineService.setItem('catchmentNumber', data[addressResults].userGeneratedId);
                                    getParentAddressLineItems(data[addressResults]);
                                    break;
                                }
                            }
                        });

                    }
                });

                var getLoginLocationAddress = function(){
                    for(var addressLevel=0; addressLevel < addressLevels.length; addressLevel++){
                        if (loginLocation[addressLevels[addressLevel].addressField] != null) {
                            return addressLevels[addressLevel].addressField;
                        }
                    }
                };

                var checkParents = function(result, addressLevel){
                    if(!result.parent) {
                        return true;
                    }
                    if(result.parent.name != loginLocation[addressLevel.addressField]) {
                        return false;
                    }
                    if(result.parent.name == loginLocation[addressLevel.addressField]) {
                        return checkParents(result.parent, getParentAddressLevel(addressLevel.addressField))
                    }
                };

                var getParentAddressLevel = function (addressField){
                    var parent = null;
                    for(var addrLevel=0; addrLevel < addressLevels.length; addrLevel++){
                        if(addressLevels[addrLevel].addressField == addressField) {
                            return parent;
                        }
                        parent = addressLevels[addrLevel];
                    }
                };

                var getParentAddressLineItems = function (parentAddresses){
                    var uuids = [];
                    while(parentAddresses){
                        uuids.push(parentAddresses.uuid);
                        parentAddresses = parentAddresses.parent;
                    }
                    eventLogService.getParentAddressHierarchyEntriesForLoginLocation(uuids).then(function(response){
                        var addressList = response.data;
                        angular.forEach(addressList, function(address){
                            offlineDbService.insertAddressHierarchy(address);
                        });
                        deferred.resolve({});
                    });
                };

              return deferred.promise;
            };
        }
    ]);