'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$interval', '$q', 'offlineService', 'androidDbService', 'configurationService',
        function (eventLogService, offlineDbService, $interval, $q, offlineService, androidDbService, configurationService) {
            var scheduler, addressLevels;
            if (offlineService.isAndroidApp()) {
                offlineDbService = androidDbService;
            }

            var init = function () {
                if (offlineService.getItem('catchmentNumber')) {
                    sync();
                } else {
                    var loginLocation = offlineService.getItem('LoginInformation').currentLocation;
                    configurationService.getConfigurations(['addressLevels']).then(function (addressHierarchyLevel) {
                        addressLevels = _.reverse(addressHierarchyLevel.addressLevels);
                        var addressField = getLoginLocationAddress(loginLocation);
                        _.reverse(addressLevels);
                        var params = { searchString: loginLocation[addressField], addressField: addressField};
                        eventLogService.getAddressForLoginLocation(params).then(function (results) {
                                var data = results.data;
                                for(var addressResults=0; addressResults < data.length ; addressResults++){
                                    var loginAddress = data[addressResults];
                                    if(checkParents(loginAddress, getParentAddressLevel(addressField), loginLocation)){
                                        offlineService.setItem('catchmentNumber', data[addressResults].userGeneratedId);
                                        getParentAddressLineItems(data[addressResults]);
                                        sync();
                                        break;
                                    }
                                }
                        });
                    });
                }
            };

            var checkParents = function(result, addressLevel, loginLocation){
                if(!result.parent)
                    return true;
                if(result.parent.name != loginLocation[addressLevel.addressField])
                    return false;
                if(result.parent.name == loginLocation[addressLevel.addressField])
                    return checkParents(result.parent, getParentAddressLevel(addressLevel.addressField), loginLocation)
            };

            var getParentAddressLevel = function (addressField){
                var parent = null;
                for(var addrLevel=0; addrLevel < addressLevels.length; addrLevel++){
                    if(addressLevels[addrLevel].addressField == addressField)
                        return parent;
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
                    })
                });
            };

            var getLoginLocationAddress = function(loginLocation){
                for(var addressLevel=0; addressLevel < addressLevels.length; addressLevel++){
                    if (loginLocation[addressLevels[addressLevel].addressField] != null) {
                         return addressLevels[addressLevel].addressField;
                    }
                }
            };

            var sync = function () {
                offlineDbService.getMarker().then(function (marker) {
                    if (marker == undefined) {
                        marker = {
                            catchmentNumber: offlineService.getItem('catchmentNumber')
                        }
                    }
                    syncForMarker(marker);
                });
            };

            var syncForMarker = function (marker) {
                eventLogService.getEventsFor(marker.catchmentNumber, marker.lastReadEventUuid).then(function (response) {
                    if (response.data == undefined || response.data.length == 0) {
                        scheduleSync();
                        return;
                    }
                    readEvent(response.data, 0);
                });
            };

            var scheduleSync = function () {
                scheduler = $interval(function () {
                    $interval.cancel(scheduler);
                    sync();
                }, 300000, false);
            };

            var readEvent = function (events, index) {
                if (events.length == index && events.length > 0){
                    sync();
                    return;
                }
                if (events.length == index){
                    return;
                }
                var event = events[index];
                return eventLogService.getDataForUrl(Bahmni.Common.Constants.hostURL + event.object).then(function(response) {
                    return saveData(event, response).then(updateMarker(event).then(function () {
                        return readEvent(events, ++index);
                    }));
                });
            };

            var saveData = function (event, response) {
                var deferrable = $q.defer();
                switch (event.category) {
                    case 'patient':
                        offlineDbService.createPatient({patient: response.data}, "GET").then(function () {
                            deferrable.resolve();
                        });
                        break;
                    case 'Encounter':
                        deferrable.resolve();
                        break;
                    case 'addressHierarchy':
                        offlineDbService.insertAddressHierarchy(response.data).then(function () {
                            deferrable.resolve();
                        });
                        break;
                    default:
                        deferrable.resolve();
                        break;
                }
                return deferrable.promise;
            };

            var updateMarker = function (event) {
                return offlineDbService.insertMarker(event.uuid, offlineService.getItem('catchmentNumber'));
            };

            return {
                init: init
            }
        }
    ]);