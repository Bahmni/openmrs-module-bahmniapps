'use strict';

Bahmni.Clinical.Visit = function (encounters, drugOrders, consultationNotes, otherInvestigations, observations, diagnoses, dispositions, labOrders, encounterConfig, radiologyDocs) {
    this.encounters = encounters;
    this.drugOrders = drugOrders;
    this.consultationNotes = consultationNotes;
    this.otherInvestigations = otherInvestigations;
    this.observations = observations;
    this.diagnoses = diagnoses;
    this.dispositions = dispositions;
    this.labTestOrderObsMap = labOrders;
    this.encounterConfig = encounterConfig;
    this.radiologyDocs = radiologyDocs;
    this.ipdDrugSchedule = this.hasAdmissionEncounter() ? Bahmni.Clinical.DrugSchedule.create(this) : null;
    var orderGroup = new Bahmni.Clinical.OrderGroup();
    this.drugOrderGroups = orderGroup.group(drugOrders);
    this.otherInvestigationGroups = orderGroup.group(otherInvestigations);
}

Bahmni.Clinical.Visit.prototype = {
    hasDrugOrders: function () {
        return this.drugOrders.length > 0;
    },

    hasOtherInvestigations: function () {
        return this.otherInvestigations.length > 0;
    },

    hasObservations: function () {
        return this.observations.length > 0;
    },

    hasConsultationNotes: function () {
        return this.consultationNotes.length > 0;
    },
    hasLabTests: function () {
        return this.labTestOrderObsMap.length > 0;
    },
    hasData: function () {
        return this.hasDrugOrders() || this.hasObservations() || this.hasConsultationNotes() || this.hasLabTestOrders() || this.hasOtherInvestigations();
    },
    isConfirmedDiagnosis: function (certainity) {
        return certainity === 'CONFIRMED';
    },
    isPrimaryOrder: function (order) {
        return order === 'PRIMARY';
    },
    hasDiagnosis: function () {
        return this.diagnoses.length > 0;
    },
    hasDisposition: function () {
        return this.dispositions.length > 0;
    },
    numberOfDosageDaysForDrugOrder: function (drugOrder) {
        return Bahmni.Common.Util.DateUtil.diffInDays(new Date(drugOrder.startDate), new Date(drugOrder.endDate));
    },
    hasEncounters: function () {
        return this.encounters.length > 0;
    },
    _getAdmissionEncounter: function() {
        var self = this;
        return this.encounters.filter(function(encounter){ return encounter.encounterTypeUuid === self.encounterConfig.getAdmissionEncounterTypeUuid(); })[0];
    },
    hasAdmissionEncounter: function() {
        return this._getAdmissionEncounter() ? true : false;
    },
    getAdmissionDate: function() {
        var admissionEncounter = this._getAdmissionEncounter();
        return admissionEncounter ? new Date(admissionEncounter.encounterDateTime) : null;
    },
    _getDischargeEncounter: function() {
        var self = this;
        return this.encounters.filter(function(encounter){ return encounter.encounterTypeUuid === self.encounterConfig.getDischargeEncounterTypeUuid(); })[0];
    },
    getDischargeDate: function() {
        var dischargeEncounter = this._getDischargeEncounter();
        return dischargeEncounter ? new Date(dischargeEncounter.encounterDateTime) : null;
    },
    hasIPDDrugOrdes: function() {
        return this.ipdDrugSchedule && this.ipdDrugSchedule.hasDrugOrders();;
    },
    _getEncounterWithDisposition: function(dispositionCode) {
        return this.encounters.filter(function(encounter){ 
            return encounter.dispositions.some(function(disposition) { return disposition.code === dischargeCode; });
        })[0];
    },
    getDischargeDispositionEncounterDate: function() {
        var dischargeDispositionEncounter = this._getEncounterWithDisposition(Bahmni.Common.Constants.dischargeCode);
        return dischargeDispositionEncounter ? new Date(dischargeDispositionEncounter.encounterDateTime) : null;
    }
};

Bahmni.Clinical.Visit.create = function (encounterTransactions, consultationNoteConcept, labOrderNoteConcept, encounterConfig, allTestAndPanels) {
    var drugOrders, consultationNotes, otherInvestigations, observations, diagnoses = [], dispositions = [],
        orderGroup = new Bahmni.Clinical.OrderGroup(),
        orderGroupWithObs = new Bahmni.Clinical.OrderGroupWithObs(),
        resultGrouper = new Bahmni.Clinical.ResultGrouper(),
        ArrayUtil = Bahmni.Common.Util.ArrayUtil,
        isLabTests = function (order) {
            var labTestOrderTypeUuid = encounterConfig.orderTypes[Bahmni.Clinical.Constants.labOrderType];
            return order.orderTypeUuid === labTestOrderTypeUuid;
        },
        isValidationEncounter = function (encounterTransaction) {
            return encounterTransaction.encounterTypeUuid === encounterConfig.getValidationEncounterTypeUuid();
        },
        isNonLabTests = function (order) {
            return !isLabTests(order);
        },
        conceptMatches = function (observation, concepts) {
            return concepts.some(function (concept) {
                return observation.concept.uuid === concept.uuid;
            });
        },
        observationGroupingFunction = function (obs) {
            return obs.observationDateTime.substring(0, 10);
        },
        isConsultationNote = function (observation) {
            return conceptMatches(observation, [consultationNoteConcept])
        },
        isOtherObservation = function (observation) {
            return !conceptMatches(observation, [consultationNoteConcept, labOrderNoteConcept])
        },
        allOrders = function(){
            return encounterTransactions.map(function(encounterTransaction) {
                return encounterTransaction.testOrders;
            }).reduce(function(a, b) {
                    return a.concat(b);
                });
        },
        doesNotHaveOrder = function(obs){
            return !allOrders().some(function(order){
                return order.uuid === obs.orderUuid;
            });
        },
        mapAccessionNotes = function(encountersWithTestOrders){
            encounterTransactions.forEach(function (encounterTransaction) {
                if (isValidationEncounter(encounterTransaction)) {
                    encounterTransaction.accessionNotes.forEach(function (accessionNote) {
                        addAccessionNotes(encountersWithTestOrders, accessionNote);
                    });
                }
            });

            encountersWithTestOrders.forEach(function(encounterWithTestOrders){
                encounterWithTestOrders.accessionNotes &&
                    Bahmni.Common.Util.ArrayUtil.sortInReverseOrderOfField(encounterWithTestOrders.accessionNotes, 'dateTime');
            })
        },
        addAccessionNotes = function(encountersWithTestOrders, accessionNote){
            var encounterWithTestOrdersForAccessionUuid = encountersWithTestOrders.filter(function (encounterWithTestOrder) {
                return encounterWithTestOrder.accessionUuid === accessionNote.accessionUuid
            })[0];
            if (encounterWithTestOrdersForAccessionUuid) {
                encounterWithTestOrdersForAccessionUuid.accessionNotes = encounterWithTestOrdersForAccessionUuid.accessionNotes || [];
                encounterWithTestOrdersForAccessionUuid.accessionNotes.push(accessionNote);
            }
        };

    var radiologyDocs = [];
    encounterTransactions.forEach(function (encounterTransaction) {
        if(encounterTransaction.encounterTypeUuid == encounterConfig.getRadiologyEncounterTypeUuid()) {
            ArrayUtil.removeItem(encounterTransactions, encounterTransaction);
            encounterTransaction.observations.forEach(function (observation) {
                observation.groupMembers.forEach(function (member) {
                    if (member.concept.name == Bahmni.Common.Constants.documentsConceptName) {
                        radiologyDocs.push({name: observation.concept.name, src: Bahmni.Common.Constants.documentsPath + '/' + member.value, dateTime: observation.observationDateTime, provider: encounterTransaction.providers[0]});
                    }
                });
            });
        }
    });

    drugOrders = orderGroup.flatten(encounterTransactions, 'drugOrders');
    otherInvestigations = orderGroup.flatten(encounterTransactions, 'testOrders', isNonLabTests);

    var filterFunction = function(aTestOrPanel, testOrder){
        return aTestOrPanel.name.name == testOrder.concept.name;
    };
    var sort = function(allTestsAndPanels, encountersWithTestOrders, filterFunction){
        var indexOf = function(allTestAndPanels, order) {
            var indexCount = 0;
            allTestAndPanels.setMembers.every(function(aTestOrPanel) {
                if (filterFunction(aTestOrPanel, order))
                    return false;
                else {
                    indexCount++;
                    return true;
                }
            });
            return indexCount;
        };

        encountersWithTestOrders.forEach(function(encounterWithTestOrders) {
            encounterWithTestOrders.orders.sort(function(firstElement, secondElement) {
                var indexOfFirstElement = indexOf(allTestsAndPanels, firstElement);
                var indexOfSecondElement = indexOf(allTestsAndPanels, secondElement);
                return indexOfFirstElement - indexOfSecondElement;
            });
        });
        return encountersWithTestOrders;
    };

    var encountersWithTestOrders = orderGroupWithObs.create(encounterTransactions, 'testOrders', isLabTests, 'accessionUuid');
    encountersWithTestOrders = allTestAndPanels ? sort(allTestAndPanels, encountersWithTestOrders, filterFunction) : encountersWithTestOrders;

    encountersWithTestOrders.forEach(function(testOrder) {
        var orderList = [];
        testOrder.orders.forEach(function(order) {
            orderList.push(Bahmni.Clinical.TestOrder.create(order, allTestAndPanels));
        });

        testOrder.displayList = [];
        orderList.forEach(function(order) {
            testOrder.displayList = testOrder.displayList.concat(order.displayList());
        })
    });

    mapAccessionNotes(encountersWithTestOrders);

    var allObs = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
    consultationNotes = resultGrouper.group(allObs.filter(isConsultationNote), observationGroupingFunction, 'obs', 'date');
    observations = resultGrouper.group(allObs.filter(isOtherObservation).filter(doesNotHaveOrder), observationGroupingFunction, 'obs', 'date');
    observations.forEach(function(observation){
        observation.obs = new Bahmni.Clinical.CompoundObservation(observation.obs);
    });

    angular.forEach(encounterTransactions, function (encounterTransaction) {
        angular.forEach(encounterTransaction.bahmniDiagnoses, function (diagnosis) {
            var diagnosisMapper = new Bahmni.DiagnosisMapper();
            diagnoses.push(diagnosisMapper.mapDiagnosis(diagnosis));
        });

        if (encounterTransaction.disposition) {
            encounterTransaction.disposition.provider = encounterTransaction.providers[0];
            dispositions.push(encounterTransaction.disposition);
        }
    });

    return new this(encounterTransactions, drugOrders, consultationNotes, otherInvestigations, observations, diagnoses, dispositions, encountersWithTestOrders, encounterConfig, radiologyDocs);
}