'use strict';

xdescribe('Disposition DisplayControl', function () {
    var $rootScope,
        $scope,
        $compile,
        el,
        $body = $('body'),
        dispositionService,
        q,
        spinner,
        dispositions,
        dispositionPromise,
        templateCache,
        deferred,
        simpleHtml = '<disposition id="disposition" params="section" patient-uuid="patientUuid"></disposition>';


    beforeEach(function() {

        dispositions = [
            {
                "code": "ABSCONDING",
                "voided": false,
                "voidReason": null,
                "conceptName": "Absconding",
                "dispositionDateTime": "2014-12-16T16:06:49.000+0530",
                "additionalObs": [
                    {
                        "voided": false,
                        "concept": {
                            "uuid": "5723b2f2-9bc6-11e3-927e-8840ab96f0f1",
                            "conceptClass": null,
                            "shortName": null,
                            "units": null,
                            "dataType": null,
                            "name": "Disposition Note",
                            "set": false
                        },
                        "uuid": "666e89b0-05f2-4037-955e-186d412f9da5",
                        "voidReason": null,
                        "groupMembers": [],
                        "observationDateTime": null,
                        "orderUuid": null,
                        "value": "notes",
                        "comment": null
                    }
                ],
                "existingObs": "a26a8c32-6fc1-4f5e-8a96-f5f5b05b87de",
                "providers": [
                    {
                        "uuid": "d390d057-ec33-45c1-8342-9e23d706aa4d",
                        "name": "Surajkumar Surajkumar Surajkumar"
                    }
                ]
            }
        ];
    });

    beforeEach(function () {
        module('bahmni.clinical', function($provide){
            dispositionPromise = specUtil.respondWith({data: dispositions});
            dispositionService = jasmine.createSpyObj('dispositionService', ['getDispositionByVisit']);
            dispositionService.getDispositionByVisit.and.callFake(function(param) {
                return dispositionPromise;
            });

            $provide.value('dispositionService',dispositionService);
            $provide.value('spinner', spinner);

        });

        inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            templateCache = $injector.get('$templateCache');
            templateCache.put('displaycontrols/disposition/views/disposition.html', '<div>ABC</div>');
            q = $injector.get('$q');
            deferred = q.defer();

            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            spinner.forPromise.andReturn(deferred.promise);

            $scope = $rootScope.$new();
            $scope.section = {
                visitUuid: "1234"
            };
            $compile = $injector.get('$compile');
            el = $compile(angular.element(simpleHtml))($scope);
        });

        $body.append(el);
        $rootScope.$digest();

    });


    xit('should call getDispositionByVisit when visitUuid is passed', function () {
        deferred.resolve(dispositionPromise);
        $rootScope.$apply();

        expect($scope.dispositions).not.toBeUndefined();

        //$scope.init();
        //deferred.resolve({response: dispositionResponse});
        //$scope.$root.$digest();
        //expect($scope.dispositions)


        //expect(dispositionService.getDispositionByVisit.calls.mostRecent().args[1]).toBe("1234");


    });


});