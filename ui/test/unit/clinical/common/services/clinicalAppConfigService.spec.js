'use strict';
describe("clinicalAppConfigService", function () {
    var _sessionService;
    var $stateParams;
    var loadConfigService;
    var urlHelper;

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    var appJson = {"data":
        {
            "id": "bahmni.clinical",
            "config": {
                "obsIgnoreList": ["Fee Information", "Patient file"],
                "otherInvestigationsMap": {
                    "Radiology": "Radiology Order",
                    "Endoscopy": "Endoscopy Order"
                },
                "visitPage": {
                    "investigationResultParams": {
                        "title": "Investigations"
                    }
                },
                "printConfig": {
                    "visitSummaryPrint": {
                        "showChart": false
                    }
                },
                "conceptSetUI": {
                    "Receptor Status": {
                        "grid": true
                    },
                    "Pathologic Diagnosis": {
                        "multiSelect": true
                    }
                },
                "drugOrder": {
                    "defaultDurationUnit": "Day(s)",
                    "defaultInstructions": "As directed",
                    "frequencyDefaultDurationUnitsMap": [
                        {
                            "minFrequency": "1/7",
                            "maxFrequency": 5,
                            "defaultDurationUnit": "Day(s)"
                        }
                    ],
                    "drugFormDefaults": {
                        "Ayurvedic": {
                            "doseUnits": "Teaspoon",
                            "route": "Oral"
                        },
                        "Capsule": {
                            "doseUnits": "Capsule(s)",
                            "route": "Oral"
                        },
                        "Tablet": {
                            "doseUnits": "Tablet(s)",
                            "route": "Oral"
                        }
                    }
                }

            }

        }
    };

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
        },

        {
            "id": "bahmni.clinical.treatment.links",
            "extensionPointId": "org.bahmni.clinical.treatment.links",
            "type": "link",
            "label": "Open <u>Q</u>uotation",
            "url": "http://localhost:8069/quotations/latest?patient_ref={{patient_ref}}",
            "shortcutKey": "q",
            "requiredPrivilege": "app:billing"
        },
        {
            "id": "bahmni.clinical.billing.treatment",
            "extensionPointId": "org.bahmni.clinical.consultation.board",
            "type": "link",
            "label": "Medications",
            "translationKey": "Medication",
            "url": "treatment",
            "icon": "fa-user-md",
            "order": 8,
            "requiredPrivilege": "app:clinical:consultationTab"
        }
    ]
    };

    var medicationJson = {data: {
        view: "custom",
        sections: {
            "activeTBDrugs":{
                title: "Active TB Drugs"
            }
        }
    }
    };

    var createSpyObjects = function() {
        loadConfigService = jasmine.createSpyObj('loadConfigService', ['loadConfig']);
        loadConfigService.loadConfig.and.callFake(function (url) {
            if (url.indexOf("app.json") > -1) {
                return specUtil.respondWith(appJson)
            } else if (url.indexOf("extension.json") > -1) {
                return specUtil.respondWith(extensionJson);
            } else if (url.indexOf("medication.json") > -1) {
                return specUtil.respondWith(medicationJson);
            } else {
                return specUtil.respondWith({});
            }
        });

        _sessionService = jasmine.createSpyObj('sessionService', ['loadCredentials', 'loadProviders']);
        _sessionService.loadCredentials.and.callFake(function () {
            return  specUtil.respondWith({"privileges": [
                {"name": "app:clinical:observationTab"},
                {"name": "app:clinical:consultationTab"},
                {"name": "app:clinical:history"},
                {"name": "app:billing"},
            ]});
        });
        _sessionService.loadProviders.and.callFake(function () {
            return  specUtil.respondWith({});
        });
        urlHelper = {
            getPatientUrl: function () {
                return "/patient/somePatientUuid"
            }
        };
    };


    describe("should fetch app config and extension config", function() {

        beforeEach(module(function ($provide) {
            createSpyObjects();

            $stateParams = {configName: 'default'};

            $provide.value('sessionService', _sessionService);
            $provide.value('$q', Q);
            $provide.value('$stateParams', $stateParams);
            $provide.value('urlHelper', urlHelper);
            $provide.value('loadConfigService', loadConfigService);
            $provide.value('$translate', jasmine.createSpyObj("$translate", ['instant']));
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

        it('should fetch visitPage config', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var result = clinicalAppConfigService.getVisitPageConfig();
                expect(result.investigationResultParams.title).toBe("Investigations");
                done();
            });
        });

        it('should fetch printConfig', function (done) {
            appService.initApp('clinical', {'app': true}).then(function () {
                var result = clinicalAppConfigService.getPrintConfig();
                expect(result.visitSummaryPrint.showChart).toBe(false);
                done();
            });
        });

        it('should fetch medication config', function (done) {
            appService.initApp('clinical', {'app': true}, null, ['medication']).then(function (result) {
                var result = clinicalAppConfigService.getMedicationConfig();
                expect(result.view).toBe("custom");
                expect(result.sections['activeTBDrugs']).toEqual({
                    title: "Active TB Drugs"
                });
                done();
            });
        })

        });

        describe("should fetch extension config", function () {
            it('should fetch consultation boards', function (done) {
                appService.initApp('clinical', {'extension': true}).then(function () {
                    var result = clinicalAppConfigService.getAllConsultationBoards();
                    expect(result.length).toBe(2);
                    done();
                });
            });

            it('should fetch consultation board link', function (done) {
                appService.initApp('clinical', {'extension': true}).then(function () {
                    var result = clinicalAppConfigService.getConsultationBoardLink();
                    expect(result).toBe("/default/patient/somePatientUuid/concept-set-group/observations?encounterUuid=active");
                    done();
                });
            });

            it('should fetch treatment action link', function (done) {
                appService.initApp('clinical', {'extension': true}).then(function () {
                    var result = clinicalAppConfigService.getTreatmentActionLink();
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
        describe("should send parameters for program uuid and enrollment uuid", function(){
        beforeEach(module(function ($provide) {
            createSpyObjects();

            $stateParams = {configName: 'default', programUuid : "programUuid", enrollment : "enrollmentUuid"};

            $provide.value('sessionService', _sessionService);
            $provide.value('$q', Q);
            $provide.value('$stateParams', $stateParams);
            $provide.value('urlHelper', urlHelper);
            $provide.value('loadConfigService', loadConfigService);
            $provide.value('$translate', jasmine.createSpyObj("$translate", ['instant']));
        }));


        var clinicalAppConfigService;
        var appService;

        beforeEach(inject(['clinicalAppConfigService', 'appService', function (clinicalAppConfigServiceInjected, appServiceInjected) {
            clinicalAppConfigService = clinicalAppConfigServiceInjected;
            appService = appServiceInjected;
        }]));

        it('should fetch consultation board link with parameters', function (done) {
            appService.initApp('clinical', {'extension': true}).then(function () {
                var result = clinicalAppConfigService.getConsultationBoardLink();
                expect(result).toBe("/default/patient/somePatientUuid/concept-set-group/observations?programUuid=programUuid&enrollment=enrollmentUuid&dateEnrolled=undefined&dateCompleted=undefined");
                done();
            });
        });
    });

});
