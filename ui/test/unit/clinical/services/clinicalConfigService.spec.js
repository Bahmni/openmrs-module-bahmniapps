describe("clinicalAppConfigService", function () {
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
                }
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
            } else {
                return specUtil.respondWith({});
            }
        });

        _sessionService = jasmine.createSpyObj('sessionService', ['loadCredentials', 'loadProviders']);
        _sessionService.loadCredentials.and.callFake(function () {
            return  specUtil.respondWith({"privileges": [
                {"name": "app:clinical:observationTab"},
                {"name": "app:clinical:history"}
            ]});
        });
        _sessionService.loadProviders.and.callFake(function () {
            return  specUtil.respondWith({});
        });


        $provide.value('$http', _$http);
        $provide.value('sessionService', _sessionService);
        $provide.value('$q', Q);
    }));


    var clinicalAppConfigService;
    var appService;

    beforeEach(inject(['clinicalAppConfigService', 'appService', function (clinicalAppConfigServiceInjected, appServiceInjected) {
        clinicalAppConfigService = clinicalAppConfigServiceInjected;
        appService = appServiceInjected;
    }]));


    describe("should fetch app config", function () {
        it('should fetch concept config', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var result1 = clinicalAppConfigService.getConceptConfig("Receptor Status");
                expect(result1.grid).toBe(true);
                var result2 = clinicalAppConfigService.getConceptConfig("Pathologic Diagnosis");
                expect(result2.multiSelect).toBe(true);
                done();
            });
        });

        it('should fetch all concepts config', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var config = clinicalAppConfigService.getAllConceptsConfig();
                expect(config).toEqual({ "Receptor Status": { "grid": true }, "Pathologic Diagnosis": { "multiSelect": true } });
                done();
            });
        });

        it('should fetch obs ignore list and combine with default set of obs to ignore', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var result = clinicalAppConfigService.getObsIgnoreList();
                expect(result).toEqual(["Impression", "Fee Information", "Patient file"]);
                done();
            });
        });

        it('should fetch other investigations', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var results = clinicalAppConfigService.getOtherInvestigationsMap();
                expect(results.value).toEqual({ Radiology : 'Radiology Order', Endoscopy : 'Endoscopy Order' });
                done();
            });
        });
    });

    describe("should fetch extension config", function () {
        it('should fetch consultation boards', function (done) {
            appService.initApp('clinical', {'extension': true}).then(function () {
                var result = clinicalAppConfigService.getAllConsultationBoards();
                expect(result.length).toBe(1);
                done();
            });
        });

        it('should fetch concept set extensions', function (done) {
            appService.initApp('clinical', {'extension': true}).then(function () {
                var result = clinicalAppConfigService.getAllConceptSetExtensions("observations");
                expect(result.length).toBe(2);
                done();
            });
        })
    });
});
