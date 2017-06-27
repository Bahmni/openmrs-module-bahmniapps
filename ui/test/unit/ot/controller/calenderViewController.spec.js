'use strict';

describe("calendarViewController", function () {

    var controller, rootScope, scope;
    var state = jasmine.createSpyObj('$state', ['go']);
    var patientService = jasmine.createSpyObj('patientService', ['search']);
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    appDescriptor.getConfigValue.and.callFake(function (value) {
        if (value == 'calendarView') {
            return {dayViewStart: "09:00",
                dayViewEnd: "17:00",
                dayViewSplit: "60"};
        }
    });

    patientService.search.and.returnValue(specUtil.simplePromise({data: {results: [{name: "new Patient", uuid: "patientUuid"}]}}));
    locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: {results: [{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]}}));

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
    });

    var createController = function () {
        controller('calendarViewController', {
            $rootScope: rootScope,
            $scope: scope,
            $state: state,
            appService: appService,
            patientService: patientService,
            locationService: locationService
        });
    };

    it('should go to the previous date on click of left arrow', function () {
        createController();
        scope.viewDate = new Date(moment('2017-02-01').startOf('day'));
        scope.goToPreviousDate(scope.viewDate);
        expect(scope.viewDate).toEqual((moment('2017-01-31').startOf('day')).toDate());
        expect(state.viewDate).toEqual((moment('2017-01-31').startOf('day')).toDate());
    });

    it('should go to the next date on click of right arrow', function () {
        createController();
        scope.viewDate = new Date(moment('2017-02-01').startOf('day'));
        scope.goToNextDate(scope.viewDate);
        expect(scope.viewDate).toEqual((moment('2017-02-02').startOf('day')).toDate());
        expect(state.viewDate).toEqual((moment('2017-02-02').startOf('day')).toDate());
    });

    it('should go to the current date on click of today', function () {
        createController();
        scope.goToCurrentDate();
        expect(scope.viewDate).toEqual((moment().startOf('day')).toDate());
        expect(state.viewDate).toEqual((moment().startOf('day')).toDate());
    });

    it('Should search the patient with the given search string', function () {
        createController();
        scope.patient = "new pat";
        scope.search();
        expect(patientService.search).toHaveBeenCalledWith(scope.patient);
    });

    it('Should add the patient info onto the filter parameters on selecting the patient', function () {
        createController();
        var patientInfo = {name: "new Patient", uuid: "patientUuid", identifier: "EQ10001"};
        scope.onSelectPatient(patientInfo);
        expect(scope.filters.patient).toBe(patientInfo);
    });

    it('Should clear the patient filter from filter parameters upon clearing the patient info', function () {
        createController();
        var patientInfo = {name: "new Patient", uuid: "patientUuid", identifier: "EQ10001"};
        scope.clearThePatientFilter(patientInfo);
        expect(scope.filters.patient).toBe(null);
    });

    it('Should map the response of search results from the server and add label field', function () {
        createController();
        var patientInfo = {givenName: "new", familyName: "Patient", uuid: "patientUuid", identifier: "EQ10001"};
        var responseMap = scope.responseMap([patientInfo]);
        expect(responseMap[0].givenName).toBe("new");
        expect(responseMap[0].familyName).toBe("Patient");
        expect(responseMap[0].uuid).toBe("patientUuid");
        expect(responseMap[0].identifier).toBe("EQ10001");
        expect(responseMap[0].label).toBe("new Patient (EQ10001)");
    });

    it('Should clear all the filters', function () {
        var fakeSurgeonInput = document.createElement("input");
        var fakeStatusInput = document.createElement("input");
        fakeSurgeonInput.setAttribute("class", "input");
        fakeStatusInput.setAttribute("class", "input");
        document.body.appendChild(fakeSurgeonInput);
        document.body.appendChild(fakeStatusInput);
        createController();
        scope.clearFilters();
        expect(scope.filters.providers).toEqual([]);
        expect(scope.filters.statusList).toEqual([]);
        expect(scope.patient).toBe("");
        expect(scope.filters.patient).toBe(null);
    });

    it('Should apply all the filters', function () {

        createController();
        scope.filters = {locations: {"location1": true, "location2": false}, providers: [{uuid: "providerUuid1"}],
            patient: {uuid: "patientUuid2", value: "firstName2 lastName2", identifier: "IQ10002"},
            statusList: [{name: "COMPLETED"}]
        };
        scope.applyFilters();
        expect(scope.filterParams).toEqual(scope.filters);
        expect(state.filterParams).toEqual(scope.filters);
    });

    it('Should initialize the filter data', function () {
        rootScope.surgeons = [{
            "uuid": "batmanUuid",
            "person": {
                "display": "Bat Man"
            },
            "attributes": [
                {
                    "attributeType": {
                        "display": "otCalendarColor"
                    },
                    "value": "90"
                }
            ]
        },
            {
                "uuid": "spidermanUuid",
                "person": {
                    "display": "Spider Man"
                },
                "attributes": []
            }];

        var mappedSurgeons = [{name: "Bat Man", uuid: "batmanUuid", "Bat Man": false, otCalendarColor: "hsl(90, 100%, 90%)"}, {name: "Spider Man", uuid: "spidermanUuid", "Spider Man": false, otCalendarColor: "hsl(0, 100%, 90%)"}];
        state.filterParams = undefined;
        createController();
        expect(scope.filters.locations).toEqual({"location1": true, "location2": true});
        expect(scope.filters.providers).toEqual([]);
        expect(scope.filters.statusList).toEqual([]);
        expect(scope.appointmentStatusList).toEqual([{name: "SCHEDULED"}, {name: "COMPLETED"}]);
        expect(scope.locations).toEqual([{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]);
        expect(scope.surgeonList).toEqual(mappedSurgeons);
        expect(scope.patient).toBeUndefined();
    });

    it('Should initialize the filter data from stateParams if present', function () {
        rootScope.surgeons = [{
            "uuid": "batmanUuid",
            "person": {
                "display": "Bat Man"
            },
            "attributes": [
                {
                    "attributeType": {
                        "display": "otCalendarColor"
                    },
                    "value": "90"
                }
            ]
        },
            {
                "uuid": "spidermanUuid",
                "person": {
                    "display": "Spider Man"
                },
                "attributes": []
            }];
        var mappedSurgeons = [{name: "Bat Man", uuid: "batmanUuid", "Bat Man": false, otCalendarColor: "hsl(90, 100%, 90%)"}, {name: "Spider Man", uuid: "spidermanUuid", "Spider Man": false, otCalendarColor: "hsl(0, 100%, 90%)"}];

        state.filterParams = {locations: {"location1": true, "location2": false}, providers: [{uuid: "providerUuid1"}],
            patient: {uuid: "patientUuid2", value: "firstName2 lastName2", identifier: "IQ10002"},
            statusList: [{name: "COMPLETED"}]
        };
        createController();
        expect(scope.filters).toEqual(state.filterParams);
        expect(scope.filters.locations).toEqual({"location1": true, "location2": false});
        expect(scope.filters.providers).toEqual([{uuid: "providerUuid1"}]);
        expect(scope.filters.statusList).toEqual([{name: "COMPLETED"}]);
        expect(scope.filters.patient).toEqual({uuid: "patientUuid2", value: "firstName2 lastName2", identifier: "IQ10002"});
        expect(scope.appointmentStatusList).toEqual([{name: "SCHEDULED"}, {name: "COMPLETED"}]);
        expect(scope.locations).toEqual([{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]);
        expect(scope.surgeonList).toEqual(mappedSurgeons);
        expect(scope.patient).toEqual("firstName2 lastName2");
    });
});