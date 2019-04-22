'use strict';

describe('versionedFormController', function () {
    var scope,
        $aController, formService, appService, mockBackend, q;

    beforeEach(module('bahmni.common.displaycontrol.forms'));

    beforeEach(module('bahmni.common.displaycontrol.forms', function ($provide) {
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        formService = jasmine.createSpyObj('formService', ['getAllPatientForms']);
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return true;
            }
        });

        $provide.value('$state', {});
        $provide.value('formService', formService);
        $provide.value('appService', appService);
        $provide.value('$state', {params: {enrollment: "patientProgramUuid"}})
    }));

    beforeEach(inject(function ($rootScope, $httpBackend, $q, $controller) {
        scope = $rootScope;
        $aController = $controller;
        q = $q;
        scope.patient = {uuid: '123'};
        scope.section = {dashboardConfig: {maximumNoOfVisits: 10}};
        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/forms/views/formsTable.html').respond("<div>dummy</div>");
    }));

    var createController = function () {
        $aController('versionedFormController', {
            $scope: scope,
            appService: appService,
            formService: formService,
            $q: q
        })
    };


    var mockFormService = function (data) {
        formService.getAllPatientForms.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    it('should return formName', function () {
        createController();
        let formData = {formName: 'Test Form'};

        expect(scope.getDisplayName(formData)).toEqual('Test Form');
    });

    it('should set formsNotFound to true when data is empty', function () {
        const formDataObj = {"data": []};
        mockFormService(formDataObj);
        createController();
        scope.$digest();

        expect(formService.getAllPatientForms.calls.count()).toEqual(1);
        expect(scope.formsNotFound).toBe(true);
    });

    it('should filter forms based on formGroup given in config', function () {
        let formData = [{formName: 'First', encounterDateTime: '2015-12-18T17:26:31.000+0000'}, {
            formName: 'Second',
            encounterDateTime: '2015-12-18T16:26:31.000+0000'
        }, {formName: 'Third', encounterDateTime: '2015-12-16T16:26:31.000+0000'}];
        let expectedFormData = [{formName: 'First', encounterDateTime: '2015-12-18T17:26:31.000+0000'}, {
            formName: 'Second',
            encounterDateTime: '2015-12-18T16:26:31.000+0000'
        }];
        let data = {"data": formData};
        scope.section.formGroup = ['First', 'Second'];
        mockFormService(data);
        createController();
        scope.$digest();

        expect(formService.getAllPatientForms.calls.count()).toEqual(1);
        expect(scope.formData).toEqual(expectedFormData);
    });

    it('should show only latest unique forms on the dashboard', function () {
        let formData = [{formName: 'First', encounterDateTime: '2015-12-18T17:26:31.000+0000'}, {
            formName: 'Second',
            encounterDateTime: '2015-12-17T16:26:31.000+0000'
        }, {formName: 'First', encounterDateTime: '2015-12-16T16:26:31.000+0000'}];
        let expectedFormData = [{formName: 'First', encounterDateTime: '2015-12-18T17:26:31.000+0000'}, {
            formName: 'Second',
            encounterDateTime: '2015-12-17T16:26:31.000+0000'
        }];
        let data = {"data": formData};
        scope.isOnDashboard = true;
        scope.section.formGroup = ['First', 'Second'];
        mockFormService(data);
        createController();
        scope.$digest();

        expect(formService.getAllPatientForms.calls.count()).toEqual(1);
        expect(scope.formData).toEqual(expectedFormData);
    });

    it('should show all forms if not on the dashboard', function () {
        let formData = [{formName: 'First', encounterDateTime: '2015-12-18T17:26:31.000+0000'}, {
            formName: 'Second',
            encounterDateTime: '2015-12-17T16:26:31.000+0000'
        }, {formName: 'First', encounterDateTime: '2015-12-16T16:26:31.000+0000'}];
        let data = {"data": formData};
        scope.section.formGroup = ['First', 'Second'];
        mockFormService(data);
        createController();
        scope.$digest();

        expect(formService.getAllPatientForms.calls.count()).toEqual(1);
        expect(scope.formData).toEqual(formData);
    });

    it('should set dialog data', function () {
        var expectedDialogData = {
            "patient": scope.patient,
            "section": scope.section
        };
        createController();
        scope.$digest();

        expect(scope.dialogData).toEqual(expectedDialogData);
    });

    it('should get EditObs data for given formData', function () {
        var formData = {
            formName: "EditForm",
            formVersion: "V2"
        };
        var expectedEditObsData = {
            observation: formData,
            conceptSetName: "EditForm",
            conceptDisplayName: "EditForm"
        };
        createController();
        scope.$digest();

        var actualEditObsData = scope.getEditObsData(formData);

        expect(actualEditObsData).toEqual(expectedEditObsData);
    });


});
