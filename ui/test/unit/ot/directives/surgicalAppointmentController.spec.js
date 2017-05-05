'use strict';

describe("surgicalAppointmentController", function () {
    var scope, controller, q, surgicalAppointmentHelper;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock']);
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);

    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);
    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));

    appDescriptor.getConfigValue.and.callFake(function (value) {
        if (value == 'primarySurgeonsForOT') {
            return ["uuid1", "uuid2"];
        }
        return value;
    });

    surgicalAppointmentService.getSurgeons.and.callFake(function () {
       return  {data : {results : [{uuid: "uuid1", name : "provider1"}, {uuid: "uuid2", name : "provider2"}]}};
    });

    locationService.getAllByTag.and.callFake(function () {
       return {data : {results : [{uuid: "uuid1", name : "location1"}, {uuid: "uuid2", name : "location2"}]}};
    });


    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, $q, _surgicalAppointmentHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            q = $q;
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        });
    });

    var createController = function () {
        controller('surgicalAppointmentController', {
            $scope: scope,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            locationService: locationService,
            appService: appService,
            messagingService: messagingService,
            surgicalAppointmentHelper : surgicalAppointmentHelper
        });
    };

    it("should get the surgeon Names from openMRS", function () {
        var surgeons = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var locations = {
            results: [{display: 'OT1'}, {display: 'OT2'}, {display: 'OT3'}]
        };
        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(specUtil.simplePromise({data: surgeons}));
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: locations}));
        expect(scope.surgeons).toBeUndefined();

        createController();
        expect(surgicalAppointmentService.getSurgeons).toHaveBeenCalled();
    });

    it("should not invalidate start datetime or end datetime when either of them is missing", function () {
        createController();
        expect(scope.isStartDatetimeBeforeEndDatetime()).toBeTruthy();
        expect(scope.isStartDatetimeBeforeEndDatetime(new Date())).toBeTruthy();
        expect(scope.isStartDatetimeBeforeEndDatetime(undefined, new Date())).toBeTruthy();
    });

    it("should validate a form having end date greater than start date", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeTruthy();
    });

    it("should not validate a form having end date less than start date", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeFalsy();
    });

    it("should throw message if the surgical form is not valid on save", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = false;
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        scope.save(scope.surgicalForm);
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_ENTER_MANDATORY_FIELDS' | translate}}");
    });

    it("should save a valid surgical form", function (done) {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 3, 11);
        scope.surgicalForm.provider = {uuid: "Some uuid"};

        var promise = specUtil.simplePromise({data: scope.surgicalForm});
        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(promise);

        scope.save(scope.surgicalForm);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
        done();
    });

    it("should throw an error when we save an invalid surgical form", function (done) {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 3, 11);
        scope.surgicalForm.provider = {uuid: "Some uuid"};

        var deferred = q.defer();
        deferred.reject({});
        scope.$apply();
        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(deferred.promise);

        scope.save(scope.surgicalForm);
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_SAVE_FAILURE_MESSAGE_KEY' | translate}}");
        done();
    });
});
