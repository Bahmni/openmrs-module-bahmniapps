'use strict';

angular.module('bahmni.clinical')
    .service('visitTabConfig', ['appService', function (appService) {
        var self = this;

        var defaultVisitTabConfig = {
            "title": "General",
            "default": true,
            "sections": [
                {
                    "type": "patientInformation",
                    "title": "Patient Information",
                    "config": {
                        "title": "PatientInformation",
                        "patientAttributes": ["caste", "class", "education", "occupation"]
                    }
                },
                {
                    "type": "diagnosis",
                    "title": "Diagnosis",
                    "config": {
                        "title": "Diagnoses",
                        "showCertainty": true,
                        "showOrder": true,
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "observation",
                    "title": "Observations",
                    "config": {
                        "numberOfVisits": 1,
                        "obsIgnoreList": ["Patient file", "Radiology", "Lab Manager Notes", "Accession Uuid", "Impression"],
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "disposition",
                    "title": "Disposition",
                    "config": {
                        "numberOfVisits": 1,
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "admissionDetails",
                    "title": "Admission Details",
                    "config": {
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "investigationResult",
                    "title": "Investigation Result",
                    "config": {
                        "title": "Lab Investigations",
                        "showChart": true,
                        "showTable": true,
                        "showNormalLabResults": true,
                        "showCommentsExpanded": true,
                        "showAccessionNotes": true,
                        "numberOfVisits": 10
                    }
                },
                {
                    "type": "treatment",
                    "title": "Treatments",
                    "config": {
                        "title": "Treatments",
                        "showFlowSheet": true,
                        "showListView": true,
                        "showOtherActive": false,
                        "showDetailsButton": true,
                        "showRoute": true,
                        "showDrugForm": true
                    }
                },
                {
                    "type": "radiology",
                    "config": {
                        "title": "Radiology"
                    }
                },
                {
                    "type": "patientFiles",
                    "config": {
                        "title": "Patient Files"
                    }
                }
            ]
        };

        this.load = function () {
            return appService.loadConfig('visit').then(function (response) {
                var defaultTab = _.find(response.data, function (visitTabConfig) {
                    return visitTabConfig.default;
                });

                if (defaultTab) {
                    var pivotTableSections = _.filter(defaultTab.sections, function (section) {
                        return section.type == "pivotTable";
                    });
                    defaultVisitTabConfig.sections = defaultVisitTabConfig.sections.concat(pivotTableSections);
                    angular.extend(defaultTab, defaultVisitTabConfig);
                } else {
                    response.data.push(defaultVisitTabConfig);
                }

                angular.extend(self, new Bahmni.Clinical.VisitTabConfig(response.data));
            });
        }

    }]);