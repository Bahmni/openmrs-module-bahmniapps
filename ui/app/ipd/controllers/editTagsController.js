'use strict';

angular.module('bahmni.ipd').controller('editTagsController', ['$scope', '$rootScope', '$q', 'ngDialog', 'spinner', 'messagingService', 'bedTagMapService',
    function ($scope, $rootScope, $q, ngDialog, spinner, messagingService, bedTagMapService) {
        $scope.allTags = [];
        var assignedTags = [];
        var unAssignedTags = [];
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
            assignedTags = getTagsInfo();
            bedTagMapService.getAllBedTags().then(function (response) {
                $scope.allTags = response.data.results;
                selectedValues = getTagsInfo();
                unAssignedTags = _.xorBy($scope.allTags, assignedTags, 'uuid');
                $scope.values = selectedValues;
            });
        };

        $scope.search = function (query) {
            var matchingAnswers = [];
            var unselectedValues = _.xorBy($scope.allTags, selectedValues, 'uuid');
            _.forEach(unselectedValues, function (answer) {
                if (typeof answer.name != "object" && answer.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                    matchingAnswers.push(answer);
                }
            });
            return _.uniqBy(matchingAnswers, 'uuid');
        };
        $scope.focusOnTheTest = function () {
            var autoSelectInput = $("input.input");
            autoSelectInput[0].focus();
        };
        $scope.addItem = function (item) {
            var find = _.find(unAssignedTags, {uuid: item.uuid});
            var itemList = find ? [find] : [];
            deltaSelected = _.xorBy(deltaSelected, itemList, 'uuid');
            selectedValues = _.union(assignedTags, deltaSelected, 'uuid');
            deltaDeSelected = _.remove(deltaDeSelected, function (value) {
                return value.uuid !== item.uuid;
            });
            selectedValues = _.xorBy(selectedValues, deltaDeSelected, 'uuid');
        };

        $scope.removeItem = function (item) {
            var find = _.find(assignedTags, {uuid: item.uuid});
            var itemList = find ? [find] : [];
            deltaDeSelected = _.xorBy(deltaDeSelected, itemList, 'uuid');
            deltaSelected = _.filter(deltaSelected, function (value) {
                return value.uuid !== item.uuid;
            });
            selectedValues = _.filter(selectedValues, function (value) {
                return value.uuid !== item.uuid;
            });
        };

        $scope.removeFreeTextItem = function () {
            var value = $("input.input").val();
            if (_.isEmpty($scope.search(value))) {
                $("input.input").val("");
            }
        };

        var assignTagsToBed = function () {
            _.each(deltaSelected, function (bedTag) {
                bedTagMapService.assignTagToABed(bedTag.id, $rootScope.selectedBedInfo.bed.bedId).then(function (response) {
                    var bedTags = $rootScope.selectedBedInfo.bed.bedTagMaps || [];
                    var bedTagMapEntry = {uuid: response.data.uuid, bedTag: bedTag};
                    bedTags.push(bedTagMapEntry);
                });
            });
            ngDialog.close();
        };
        var unAssignTagsFromBed = function () {
            _.each(deltaDeSelected, function (bedTag) {
                bedTagMapService.unAssignTagFromTheBed(bedTag.tagMapUuid).then(function () {
                    $rootScope.selectedBedInfo.bed.bedTagMaps = _.filter($rootScope.selectedBedInfo.bed.bedTagMaps, function (bedTagMap) {
                        return bedTagMap.bedTag.uuid !== bedTag.uuid;
                    });
                });
            });
        };
        $scope.updateTagsForTheSelectedBed = function () {
            spinner.forPromise($q.all(unAssignTagsFromBed(), assignTagsToBed()).then(function () {
                messagingService.showMessage('info', "Tags Updated Successfully");
            }));
        };

        $scope.cancelConfirmationDialog = function () {
            ngDialog.close();
        };

        $scope.disableTagButton = function (tag) {
            var selectedTag = _.filter($scope.values, function (tagEntry) {
                return _.isMatch(tagEntry, {uuid: tag.uuid});
            });
            return selectedTag.length > 0;
        };

        $scope.onClickingTheTag = function (tag) {
            $scope.addItem(tag);
            $scope.values = selectedValues;
        };

        init();
    }]);
