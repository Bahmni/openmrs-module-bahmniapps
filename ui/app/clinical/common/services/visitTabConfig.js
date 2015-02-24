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
                    "config": {
                        "title": "PatientInformation",
                        "patientAttributes": ["caste", "class", "education", "occupation"]
                    }
                },
                {
                    "type": "diagnosis",
                    "config": {
                        "title": "Diagnoses",
                        "showCertainty": true,
                        "showOrder": true,
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "observation",
                    "config": {
                        "numberOfVisits": 1,
                        "obsIgnoreList": ["Patient file", "Radiology", "Lab Manager Notes", "Accession Uuid", "Impression"],
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "disposition",
                    "config": {
                        "numberOfVisits": 1,
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "admissionDetails",
                    "config": {
                        "showDetailsButton": true
                    }
                },
                {
                    "type": "investigationResult",
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