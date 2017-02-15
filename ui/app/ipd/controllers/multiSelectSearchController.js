'use strict';

angular.module('bahmni.ipd').controller('multiSelectSearchController', ['$scope', '$rootScope', '$q', '$http', 'ngDialog', 'messagingService', 'spinner',
    function ($scope, $rootScope, $q, $http, ngDialog, messagingService, spinner) {
        $scope.allTags = [];
        var unselectedValues = [];
        var deltaDeSelected = [];
        var selectedValues = [];
        var deltaSelected = [];
        $scope.values = [];

        var getTagsInfo = function () {
            var bedTagMaps = _.map($rootScope.selectedBedInfo.bed.bedTagMaps, function (tagMap) {
                return {
                    tagMapUuid: tagMap.uuid,
                    id: tagMap.bedTag.id,
                    name: tagMap.bedTag.name,
                    uuid: tagMap.bedTag.uuid
                };
            });
            return bedTagMaps;
        };

        var init = function () {
            $http.get("/openmrs/ws/rest/v1/bedTag").then(function (response) {
                $scope.allTags = response.data.results;
                selectedValues = getTagsInfo();
                unselectedValues = _.xorBy($scope.allTags, selectedValues, 'uuid');
                $scope.values = selectedValues;
            });
        };

        $scope.search = function (query) {
            var matchingAnswers = [];
            _.forEach(unselectedValues, function (answer) {
                if (typeof answer.name != "object" && answer.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                    matchingAnswers.push(answer);
                }
            });
            return _.uniqBy(matchingAnswers, 'uuid');
        };

        $scope.addItem = function (item) {
            deltaSelected = _.xorBy(deltaSelected, [item], 'uuid');
            selectedValues = _.xorBy(selectedValues, [item], 'uuid');
            unselectedValues = _.remove(unselectedValues, function (value) {
                return value.uuid !== item.uuid;
            });
        };

        $scope.removeItem = function (item) {
            deltaDeSelected = _.xorBy(deltaDeSelected, [item], 'uuid');
            unselectedValues = _.xorBy(unselectedValues, [item], 'uuid');
        };

        $scope.removeFreeTextItem = function () {
            var value = $("input.input").val();
            if (_.isEmpty($scope.search(value))) {
                $("input.input").val("");
            }
        };

        var assignTagsToBed = function () {
            _.each(deltaSelected, function (bedTag) {
                var requestPayload = {
                    "bedTag": {"id": bedTag.id},
                    "bed": {"id": $rootScope.selectedBedInfo.bed.bedId}
                };
                var headers = {"Content-Type": "application/json", "Accept": "application/json"};
                $http.post("/openmrs/ws/rest/v1/bedTagMap", requestPayload, headers).then(function (response) {
                    var bedTags = $rootScope.selectedBedInfo.bed.bedTagMaps || [];
                    var bedTagMapEntry = {uuid: response.data.uuid, bedTag: bedTag};
                    bedTags.push(bedTagMapEntry);
                });
            });
            ngDialog.close();
        };
        var unAssignTagsFromBed = function () {
            _.each(deltaDeSelected, function (bedTag) {
                $http.delete("/openmrs/ws/rest/v1/bedTagMap/" + bedTag.tagMapUuid).then(function (response) {
                    var voidedItem = _.xorBy($rootScope.selectedBedInfo.bed.bedTagMaps, [bedTag], 'uuid');
                    var find = _.find($rootScope.selectedBedInfo.bed.bedTagMaps, function (bedTagMap) {
                        return bedTagMap.bedTag.uuid == bedTag.uuid;
                    });
                    $rootScope.selectedBedInfo.bed.bedTagMaps = _.filter($rootScope.selectedBedInfo.bed.bedTagMaps, function (bedTagMap) {
                        return bedTagMap.bedTag.uuid != bedTag.uuid;
                    });
                });
            });
        };
        $scope.updateTagsForTheSelectedBed = function () {
            var deltaDeSelectedCopy = _.filter(deltaDeSelected, function (item) {
                return !_.find(deltaSelected, {uuid: item.uuid});
            });
            deltaSelected = _.filter(deltaSelected, function (item) {
                return !_.find(deltaDeSelected, {uuid: item.uuid});
            });
            deltaDeSelected = deltaDeSelectedCopy;
            spinner.forPromise($q.all(unAssignTagsFromBed(), assignTagsToBed(), messagingService.showMessage('info', "Tags added successfully")));
        };

        $scope.cancelConfirmationDialog = function () {
            ngDialog.close();
        };

        init();
    }]);

