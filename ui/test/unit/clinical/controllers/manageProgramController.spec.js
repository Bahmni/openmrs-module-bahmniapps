'use strict';

describe("ManageProgramController", function () {

    var scope, rootScope, httpBackend, $bahmniCookieStore, ngDialog, i = 0, programService, _provide, deferred, q;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        _provide = $provide;

        programService = jasmine.createSpyObj('programService', ['getActiveProgramsForAPatient', 'getAllPrograms', 'then']);
        programService.getActiveProgramsForAPatient.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: activeProgramsForPatient}});
            return deferred.promise;
        });

        programService.getAllPrograms.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: allPrograms}});
            return deferred.promise;
        });

        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);

        $provide.value('programService', programService);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
    }));


    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        scope.patient = {uuid: "some uuid"};
        q = $q;
    }));

    var setUp = function () {
        inject(function ($controller, $rootScope, $q) {
            $controller('ManageProgramController', {
                $scope: scope,
                $rootScope: $rootScope,
                q: $q,
                ngDialog: ngDialog
            });
        });
    };

    it("should update active programs list", function () {
        scope.$apply(setUp);
        expect(scope.activePrograms.length).toBe(1);
    });

    var allPrograms = [
        {
            "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
            "name": "program",
            "allWorkflows": [
                {
                    "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                    "concept": {
                        "uuid": "8227f47f-3f10-11e4-adec-0800271c1b75",
                        "display": "All_Tests_and_Panels",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/8227f47f-3f10-11e4-adec-0800271c1b75",
                                "rel": "self"
                            }
                        ]
                    },
                    "retired": false,
                    "states": [],
                    "links": [
                        {
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/workflow/6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                            "rel": "self"
                        }
                    ]
                }
            ],
            "links": [
                {
                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/program/1209df07-b3a5-4295-875f-2f7bae20f86e",
                    "rel": "self"
                }
            ]
        }
    ];

    var activeProgramsForPatient = [
        {
            "display": "program",
            "dateEnrolled": "2015-07-25T18:29:59.000+0000",
            "dateCompleted": null,
            "outcome": null,
            "uuid": "5b022462-4f79-4a24-98eb-8f143f942583",
            "program": {
                "name": "program",
                "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                "retired": false,
                "description": "program",
                "concept": {
                    "uuid": "c460f0d5-3f10-11e4-adec-0800271c1b75",
                    "display": "VIA Test",
                    "links": [
                        {
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c460f0d5-3f10-11e4-adec-0800271c1b75",
                            "rel": "self"
                        }
                    ]
                },
                "allWorkflows": [
                    {
                        "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                        "concept": {
                            "uuid": "8227f47f-3f10-11e4-adec-0800271c1b75",
                            "display": "All_Tests_and_Panels",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/8227f47f-3f10-11e4-adec-0800271c1b75",
                                    "rel": "self"
                                }
                            ]
                        },
                        "description": null,
                        "retired": false,
                        "states": [],
                        "resourceVersion": "1.8"
                    }
                ]
            }
        }
    ];
});