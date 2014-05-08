'use strict';

describe("DocumentController", function () {

    var scope;
    var documentController;
    var visitService;
    var encounterService;
    var stateParams = {patientUuid: 'pat-uuid', visitUuid: "abc"};
    var spinner;
    var encounterConfig;
    var appConfig;

    beforeEach(module('opd.documentupload'));

    beforeEach(inject(function ($rootScope) {
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        encounterService = jasmine.createSpyObj('encounterService', ['search']);
        encounterConfig = jasmine.createSpyObj('encounterConfig', ['getEncounterTypeUuid']);
        appConfig = jasmine.createSpyObj('encounterConfig', ['encounterType']);
        visitService = jasmine.createSpyObj('visitService', ['getVisitSummary']);
    }));


    var setUp = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

            var visit1 = new Bahmni.DocumentUpload.Visit();
            visit1.startDatetime = "April 21, 2014";
            visit1.stopDatetime= "April 24, 2014 23:59:59";

            var visit2 = new Bahmni.DocumentUpload.Visit();
            visit2.startDatetime = "April 25, 2014";
            visit2.stopDatetime = "April 25, 2014 23:59:59";


            scope.encounterConfig = encounterConfig;
            scope.appConfig = appConfig;

            documentController = $controller('DocumentController', {
                $scope: scope,
                spinner: spinner,
                $rootScope: scope,
                $stateParams: stateParams
            });
            scope.visits = [visit1,visit2];

        });
    };

    describe("checkValidityOfDate", function () {
        it('should not be valid date if date overlaps with existing visit', function () {
            setUp();
            var newVisit = new Bahmni.DocumentUpload.Visit();
            scope.newVisit = newVisit;

            newVisit.startDatetime = "April 22, 2014";
            newVisit.stopDatetime = "April 22, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 21, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 24, 2014"
            newVisit.stopDatetime = "April 25, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 4, 2014"
            newVisit.stopDatetime = "April 5, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 29, 2014"
            newVisit.stopDatetime = "April 30, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 26, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 25, 2014"
            newVisit.stopDatetime = "April 25, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 23, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 19, 2014"
            newVisit.stopDatetime = "April 23, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 20, 2014"
            newVisit.stopDatetime = "April 24, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 19, 2014"
            newVisit.stopDatetime = "April 29, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 29, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 24, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 25, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);
        });
        it('should not be valid date if date overlaps with existing visit when the visit has no end date', function () {
            var visit3 = new Bahmni.DocumentUpload.Visit();
            visit3.startDatetime = "April 25, 2014";
            visit3.stopDatetime = "Invalid Date";
            setUp();
            var newVisit = new Bahmni.DocumentUpload.Visit();
            scope.newVisit = newVisit;
            scope.visits = [visit3];

            newVisit.startDatetime = "April 25, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "April 27, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "April 26, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 24, 2014";
            newVisit.stopDatetime = "April 24, 2014";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 23, 2014";
            newVisit.stopDatetime = "April 24, 2014";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 25, 2014";
            newVisit.stopDatetime = "April 25, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);


            newVisit.startDatetime = "December 25, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "December 25, 2013";
            newVisit.stopDatetime = "April 25, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);

        });

    });
});
