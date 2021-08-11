'use strict';

describe('editTagsController', function () {
    var controller, rootScope, scope, ngDialog, spinner, q, messagingService, bedTagMapService;

    var bedTags = [
        {
            "id": 1,
            "name": "Lost",
            "uuid": "73e846d6-ed5f-11e6-a3c9-0800274a5156"
        }, {
            "id": 2,
            "name": "Isolation",
            "uuid": "76783641-ed5f-11e6-a3c9-0800274a5156"
        }, {
            "id": 3,
            "name": "Strict Isolation",
            "uuid": "7739dc9f-ed5f-11e6-a3c9-0800274a5156"
        }];
    var strictIsolationTagMapUuid = "Strict Isolation tagMapUuid";
    ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    spinner.forPromise.and.returnValue(specUtil.simplePromise({data: {}}));
    messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    bedTagMapService = jasmine.createSpyObj('bedTagMapService', ['getAllBedTags', 'assignTagToABed', 'unAssignTagFromTheBed']);
    bedTagMapService.getAllBedTags.and.returnValue(specUtil.simplePromise({data: {results: bedTags}}));
    bedTagMapService.assignTagToABed.and.returnValue(specUtil.simplePromise({data: {uuid: strictIsolationTagMapUuid}}));
    bedTagMapService.unAssignTagFromTheBed.and.returnValue(specUtil.simplePromise({data: {results: bedTags}}));

    beforeEach(function () {
        module('bahmni.ipd');
    });

    var initController = function (rootScope) {
        controller('editTagsController', {
            $scope: scope,
            $rootScope: rootScope,
            $q: q,
            ngDialog: ngDialog,
            messagingService: messagingService,
            spinner: spinner,
            bedTagMapService: bedTagMapService
        });
    };

    beforeEach(function () {
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            rootScope = $rootScope;
            q = $q;
            scope = $rootScope.$new();
        });
        var bedTagMaps = [{bedTag: bedTags[0], uuid: "Lost tagMapUuid"}, {
            bedTag: bedTags[1],
            uuid: "Isolation tagMapUuid"
        }];
        rootScope.selectedBedInfo = {bed: {id: "1", bedTagMaps: bedTagMaps}};
    });

    it('should close ngDialog on cancel', function () {
        initController(rootScope);
        scope.cancelConfirmationDialog();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it('should disable the button for the tag, if the tag is selected', function () {
        initController(rootScope);
        var tag = {name: "Isolation", uuid: "76783641-ed5f-11e6-a3c9-0800274a5156"};
        var disableTagButton = scope.disableTagButton(tag);
        expect(disableTagButton).toBeTruthy();
    });

    it('should enable the button for the tag, if the tag is not selected', function () {
        initController(rootScope);
        var tag = {name: "Strict Isolation", uuid: "7739dc9f-ed5f-11e6-a3c9-0800274a5156"};
        var disableTagButton = scope.disableTagButton(tag);
        expect(disableTagButton).toBeFalsy();
    });

    it('should get all bedTags and bedTagMaps for the selected bed', function () {
        var mappedBedTagMapsOfSelectedBed = [{
            "id": 1,
            "name": "Lost",
            "uuid": "73e846d6-ed5f-11e6-a3c9-0800274a5156",
            tagMapUuid: "Lost tagMapUuid"
        }, {
            "id": 2,
            "name": "Isolation",
            "uuid": "76783641-ed5f-11e6-a3c9-0800274a5156",
            tagMapUuid: "Isolation tagMapUuid"
        }];
        initController(rootScope);
        expect(scope.allTags).toBe(bedTags);
        expect(scope.values).toEqual(mappedBedTagMapsOfSelectedBed);
        expect(bedTagMapService.getAllBedTags).toHaveBeenCalled();
    });

    it('should be able search tags, if tags are not selected', function () {
        initController(rootScope);
        var bedTagStrictIsolation = bedTags[2];
        var query = "str";
        var searchResults = scope.search(query);
        expect(searchResults).toContain(bedTagStrictIsolation);
    });

    it('should be able to add tags, on clicking the tag button', function () {
        initController(rootScope);
        var bedTagStrictIsolation = bedTags[2];
        scope.onClickingTheTag(bedTagStrictIsolation);
        expect(scope.values).toContain(bedTagStrictIsolation);
    });

    it('should update the bedTagMaps for the selected bed, on click of update', function () {
        q.all = function () {
            return specUtil.simplePromise({data: {}});
        };
        var bedTagStrictIsolation = bedTags[2];
        var mappedBedTagStictIsolation = {bedTag: bedTagStrictIsolation, uuid: strictIsolationTagMapUuid};
        var lostBedTagMap = {
            "id": 1,
            "name": "Lost",
            "uuid": "73e846d6-ed5f-11e6-a3c9-0800274a5156",
            tagMapUuid: "Lost tagMapUuid"
        };

        initController(rootScope);
        scope.addItem(bedTagStrictIsolation);
        scope.removeItem(lostBedTagMap);
        scope.updateTagsForTheSelectedBed();

        expect(rootScope.selectedBedInfo.bed.bedTagMaps.length).toBe(2);
        expect(bedTagMapService.assignTagToABed).toHaveBeenCalledWith(bedTagStrictIsolation.id, rootScope.selectedBedInfo.bed.bedId);
        expect(rootScope.selectedBedInfo.bed.bedTagMaps).toContain(mappedBedTagStictIsolation);
        expect(bedTagMapService.unAssignTagFromTheBed).toHaveBeenCalledWith(lostBedTagMap.tagMapUuid);
        expect(rootScope.selectedBedInfo.bed.bedTagMaps).not.toContain(lostBedTagMap);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "TAGS_UPDATED_SUCCESSFULLY_MESSAGE");
    });
});
