describe("clinicalConfigService", function () {
    var _$http;
    var _sessionService;

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    var appJson = {"data": [
        {
            "id": "bahmni.clinical",
            "config": {
                "obsIgnoreList": ["Fee Information", "Patient file"],
                "otherInvestigationsMap": {
                    "Radiology": "Radiology Order",
                    "Endoscopy": "Endoscopy Order"
                },
                "conceptSetUI": {
                    "Receptor Status": {
                        "grid": true
                    },
                    "Pathologic Diagnosis": {
                        "multiSelect": true
                    }
                },
                "patientDashboardSections": [
                    {
                        "title": "Diagnosis",
                        "name": "diagnosis"
                    },
                    {
                        "title": "Lab Orders",
                        "name": "labOrders"
                    }
                ]
            }

        }
    ]};

    var extensionJson = {"data": [
        {
            "id": "bahmni.clinical.consultation.observations",
            "extensionPointId": "org.bahmni.clinical.consultation.board",
            "type": "link",
            "label": "Observations",
            "url": "concept-set-group/observations",
            "default": true,
            "icon": "icon-user-md",
            "order": 1,
            "requiredPrivilege": "app:clinical:observationTab"
        },
        {
            "id": "bahmni.clinical.consultation.diagnosis",
            "extensionPointId": "org.bahmni.clinical.consultation.board",
            "type": "link",
            "label": "Diagnosis",
            "url": "diagnosis",
            "icon": "icon-user-md",
            "order": 2,
            "requiredPrivilege": "app:clinical:diagnosisTab"
        },
        {
            "id": "bahmni.clinical.conceptSetGroup.observations.history",
            "extensionPointId": "org.bahmni.clinical.conceptSetGroup.observations",
            "type": "config",
            "extensionParams": {
                "conceptName": "History and Examination",
                "default": "true"
            },
            "order": 1,
            "requiredPrivilege": "app:clinical:history"
        },

        {
            "id": "bahmni.clinical.conceptSetGroup.observations.consultationImages",
            "extensionPointId": "org.bahmni.clinical.conceptSetGroup.observations",
            "type": "config",
            "extensionParams": {
                "conceptName": "Consultation Images"
            },
            "order": 2,
            "requiredPrivilege": "app:clinical:history"
        }
    ]
    };

    beforeEach(module(function ($provide) {
        _$http = jasmine.createSpyObj('$http', ['get']);
        _$http.get.and.callFake(function (url) {
            if (url.indexOf("app.json") > -1) {
                return specUtil.respondWith(appJson)
            } else if (url.indexOf("extension.json") > -1) {
                return specUtil.respondWith(extensionJson);
            }
        });

        _sessionService = jasmine.createSpyObj('sessionService', ['loadCredentials', 'loadProviders']);
        _sessionService.loadCredentials.and.callFake(function (promiseParam) {
            return  specUtil.respondWith({"privileges": [
                {"name": "app:clinical:observationTab"},
                {"name": "app:clinical:history"}
            ]});
        });
        _sessionService.loadProviders.and.callFake(function (promiseParam) {
            return  specUtil.respondWith({});
        });


        $provide.value('$http', _$http);
        $provide.value('sessionService', _sessionService);
        $provide.value('$q', Q);
    }));


    var clinicalConfigService;
    var appService;

    beforeEach(inject(['clinicalConfigService', 'appService', function (clinicalConfigServiceInjected, appServiceInjected) {
        clinicalConfigService = clinicalConfigServiceInjected;
        appService = appServiceInjected;
    }]));


    describe("should fetch app config", function () {
        it('should fetch concept set up config', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var result1 = clinicalConfigService.getConceptSetUIConfig("Receptor Status");
                expect(result1.grid).toBe(true);
                var result2 = clinicalConfigService.getConceptSetUIConfig("Pathologic Diagnosis");
                expect(result2.multiSelect).toBe(true);
                done();
            });
        });
        it('should fetch obs ignore list', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var result = clinicalConfigService.getObsIgnoreList();
                expect(result).toEqual(["Fee Information", "Patient file"]);
                done();
            });
        });

        it('should fetch dashboard sections', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var results = clinicalConfigService.getAllPatientDashboardSections();
                expect(results.length).toBe(2);
                expect(results[0].name).toBe("diagnosis");
                expect(results[1].name).toBe("labOrders");
                done();
            });
        });

        it('should fetch other investigations', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var results = clinicalConfigService.getOtherInvestigationsMap();
                expect(results.value).toEqual({ Radiology : 'Radiology Order', Endoscopy : 'Endoscopy Order' });
                done();
            });
        });
    });

    describe("should fetch extension config", function () {
        it('should fetch consultation boards', function (done) {
            appService.initApp('clinical', {'extension': true}).then(function () {
                var result = clinicalConfigService.getAllConsultationBoards();
                expect(result.length).toBe(1);
                done();
            });
        });

        it('should fetch concept set extensions', function (done) {
            appService.initApp('clinical', {'extension': true}).then(function () {
                var result = clinicalConfigService.getAllConceptSetExtensions("observations");
                expect(result.length).toBe(2);
                done();
            });
        })
    });
});
