'use strict';

describe('dispositionService', function () {


    var _$http;
    var rootScope;
    beforeEach(module('bahmni.common.domain'));

    var dispositions = [
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

    beforeEach(module(function ($provide) {
        _$http = jasmine.createSpyObj('$http', ['get']);
        _$http.get.and.callFake(function (url) {
            if (url.indexOf(Bahmni.Common.Constants.bahmniDispositionByVisitUrl) > -1) {
                return dispositions;
            } else if (url.indexOf(Bahmni.Common.Constants.bahmniDispositionByPatientUrl) > -1) {
                return dispositions;
            } else {
                return specUtil.respondWith({});
            }
        });

        $provide.value('$http', _$http);
        $provide.value('$q', Q);
    }));

    var dispositionService;

    beforeEach(inject(function (_$rootScope_, _dispositionService_) {
        rootScope = _$rootScope_;
        dispositionService = _dispositionService_;
    }));

    it('should return dispositions by visit', function () {
        rootScope.currentUser = {
            userProperties :{
                defaultLocale : "en"
            }
        };
        var actualDispositions = dispositionService.getDispositionByVisit("1234");
        expect(actualDispositions).toEqual(dispositions);
    });

    it('should return dispositions by patient', function () {
        rootScope.currentUser = {
            userProperties :{
                defaultLocale : "en"
            }
        };
        var actualDispositions = dispositionService.getDispositionByPatient("1234");
        expect(actualDispositions).toEqual(dispositions);
    });

    it('should return disposition note concept', function () {
        dispositionService.getDispositionNoteConcept();
        expect(_$http.get).toHaveBeenCalled();
    });
    it('should return disposition actions', function () {
        dispositionService.getDispositionActions();
        expect(_$http.get).toHaveBeenCalled();
    });

});