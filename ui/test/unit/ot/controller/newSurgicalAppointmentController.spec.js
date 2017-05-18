'use strict';

describe("newSurgicalAppointmentController", function () {
    var scope, controller, q, surgicalAppointmentHelper;
    var patientService = jasmine.createSpyObj('patientService', ['search']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock','getSurgicalAppointmentAttributeTypes']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open']);

    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));

    surgicalAppointmentService.getSurgeons.and.callFake(function () {
        return  {data : {results : [{uuid: "uuid1", name : "provider1"}, {uuid: "uuid2", name : "provider2"}]}};
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
        controller('NewSurgicalAppointmentController', {
            $scope: scope,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            patientService: patientService,
            messagingService: messagingService,
            surgicalAppointmentHelper : surgicalAppointmentHelper,
            ngDialog: ngDialog
        });
    };

    it("should map the display name for patients", function () {
        var patients = [{givenName: "Natsume", familyName: "Hyuga", identifier: "IQ12345"},
            {givenName: "Sakura", familyName: "Mikan", identifier: "IQ12346"}];

        createController();
        var patientsWithDisplayName = scope.responseMap(patients);

        expect(patientsWithDisplayName.length).toEqual(2);
        expect(patientsWithDisplayName[0].label).toEqual("Natsume Hyuga (IQ12345)");
        expect(patientsWithDisplayName[1].label).toEqual("Sakura Mikan (IQ12346)");
    });

    it("should throw an error when patient is not selected", function () {
        createController();
        scope.selectedPatient = null;

        scope.createAppointmentAndAdd();
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_ENTER_MANDATORY_FIELDS' | translate}}");
    });

    it("should save data in proper format ", function () {
       createController();
       scope.selectedPatient = {label: "Natsume Hyuga (IQ12345)"}
    });

});
