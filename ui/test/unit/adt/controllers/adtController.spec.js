'use strict';

describe("AdtController", function () {
    var bedService = jasmine.createSpyObj('bedService', ['assignBed', 'setBedDetailsForPatientOnRootScope']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
    var dispositionService = jasmine.createSpyObj('dispositionService', ['getDispositionActions']);
    var visitService = jasmine.createSpyObj('visitService', ['getVisitSummary','endVisit']);
    var encounterService = jasmine.createSpyObj('encounterService', ['create']);
    var scope, rootScope, controller;

    beforeEach(function () {
        module('bahmni.adt');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {
                    conceptName: ""
                }
            }, getExtensions: function (a, b) {
                return {
                    maxPatientsPerBed: 2
                }
            },
            getConfig: function(){

            }
        });

        rootScope.encounterConfig = {getVisitTypes:function(){
            return [];
        },getAdmissionEncounterTypeUuid : function(){

        },getDischargeEncounterTypeUuid: function(){

        },getTransferEncounterTypeUuid: function(){

        }
        };

        var visitServicePromise = specUtil.createServicePromise('getVisitSummary');
        visitService.getVisitSummary.and.returnValue(visitServicePromise);
        dispositionService.getDispositionActions.and.returnValue({});
        sessionService.getLoginLocationUuid.and.returnValue("someLocationUuid");


        controller('AdtController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: {patientUuid: "patientUuid", visitUuid: "visitUuid"},
            sessionService: sessionService,
            dispositionService: dispositionService,
            encounterService: encounterService,
            bedService: bedService,
            appService: appService,
            visitService: visitService
        });
    });

    it("Should show the confirm dialog if visit type is not IPD", function () {
        scope.visitSummary = {"visitType": "OPD"};
        spyOn(window, 'confirm');

        scope.admit(null);
        expect(window.confirm).toHaveBeenCalledWith('Patient Visit Type is OPD, Do you want to close the Visit and start new IPD Visit?');
    });

    it("should close the visit if dialog is confirmed and the visit type is not IPD",function(){
        scope.visitSummary = {"visitType": "OPD","uuid":"visitUuid"};
        scope.patient = {uuid:""}; //set because local method in the controller is using it
        scope.adtObservations = [];
        spyOn(window, 'confirm');

        window.confirm.and.returnValue(true);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        encounterService.create.and.callFake(stubOnePromise);

        scope.admit(null);
        expect(visitService.endVisit).toHaveBeenCalledWith("visitUuid");

    });

    it("should not close the visit if visit type is IPD", function(){
        scope.visitSummary = {"visitType": "IPD","uuid":"visitUuid"};
        scope.patient = {uuid:""}; //set because local method in the controller is using it
        scope.adtObservations = [];
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        encounterService.create.and.callFake(stubOnePromise);

        scope.admit(null);
    })
});
