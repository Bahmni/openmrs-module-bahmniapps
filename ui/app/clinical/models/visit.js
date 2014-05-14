'use strict';

Bahmni.Clinical.Visit = function (encounters, drugOrders, consultationNotes, otherInvestigations, observations, diagnoses, dispositions, labOrders, encounterConfig, radiologyOrders, allTestsAndPanelsConceptSet, visitUuid) {
    this.uuid = visitUuid;
    this.encounters = encounters;
    this.drugOrders = drugOrders;
    this.consultationNotes = consultationNotes;
    this.otherInvestigations = otherInvestigations;
    this.observations = observations;
    this.diagnoses = diagnoses;
    this.dispositions = dispositions;
    this.labOrders = labOrders;
    this.encounterConfig = encounterConfig;
    this.radiologyOrders = radiologyOrders;

    var orderGroup = new Bahmni.Clinical.OrdersMapper();
    this.ipdDrugSchedule = this.hasAdmissionEncounter() ? Bahmni.Clinical.DrugSchedule.create(this) : null;
    this.drugOrderGroups = orderGroup.group(drugOrders);
    this.otherInvestigationGroups = orderGroup.group(otherInvestigations);

    var resultGrouper = new Bahmni.Clinical.ResultGrouper()
    var observationGroupingFunction = function (obs) {
        return obs.observationDateTime.substring(0, 10);
    };
    this.consultationNoteGroups = resultGrouper.group(consultationNotes, observationGroupingFunction, 'obs', 'date');
    this.observationGroups = resultGrouper.group(observations, observationGroupingFunction, 'obs', 'date')


    var observationSubGroupingFunction = function (obs) {
        if (!obs.concept.set) return "Others";

        return obs.concept.name;
    };
    this.observationGroups.forEach(function (observationGroup) {
        var observationSubGroups = resultGrouper.group(observationGroup.obs, observationSubGroupingFunction, 'obs', 'conceptName')
        observationSubGroups.forEach(function (observationSubGroup) {
            observationSubGroup.obs = new Bahmni.ConceptSet.ObservationMapper().getObservationsForView(observationSubGroup.obs);
        });
        observationGroup.subGroups = observationSubGroups;
    });

    this.labTestOrderObsMap = this.getLabOrdersGroupedByAccession();
    this.admissionDate = this.getAdmissionDate();
    this.visitEndDate = this.getDischargeDispositionEncounterDate() || this.getDischargeDate() || Bahmni.Common.Util.DateUtil.now();
    this.tabularResults = Bahmni.Clinical.TabularLabResults.create(labOrders, this.admissionDate, this.visitEndDate, allTestsAndPanelsConceptSet);
    this.showLabInvestigations = this.admissionDate ? false: true;
};

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
        return this.hasDrugOrders()
            || this.hasObservations()
            || this.hasConsultationNotes()
            || this.hasLabTests()
            || this.hasOtherInvestigations()
            || this.hasDiagnosis()
            || this.hasDisposition();
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
    _getAdmissionEncounter: function () {
        var self = this;
        return this.encounters.filter(function (encounter) {
            return encounter.encounterTypeUuid === self.encounterConfig.getAdmissionEncounterTypeUuid();
        })[0];
    },
    hasAdmissionEncounter: function () {
        return this._getAdmissionEncounter() ? true : false;
    },
    getAdmissionDate: function () {
        var admissionEncounter = this._getAdmissionEncounter();
        return admissionEncounter ? new Date(admissionEncounter.encounterDateTime) : null;
    },
    _getDischargeEncounter: function () {
        var self = this;
        return this.encounters.filter(function (encounter) {
            return encounter.encounterTypeUuid === self.encounterConfig.getDischargeEncounterTypeUuid();
        })[0];
    },
    getDischargeDate: function () {
        var dischargeEncounter = this._getDischargeEncounter();
        return dischargeEncounter ? new Date(dischargeEncounter.encounterDateTime) : null;
    },
    hasIPDDrugOrdes: function () {
        return this.ipdDrugSchedule && this.ipdDrugSchedule.hasDrugOrders();
        ;
    },
    _getEncounterWithDisposition: function (dispositionCode) {
        return this.encounters.filter(function (encounter) {
            return encounter.disposition && encounter.disposition.code === dispositionCode;
        })[0];
    },
    getDischargeDispositionEncounterDate: function () {
        var dischargeDispositionEncounter = this._getEncounterWithDisposition(Bahmni.Common.Constants.dischargeCode);
        return dischargeDispositionEncounter ? new Date(dischargeDispositionEncounter.encounterDateTime) : null;
    },
    getLabOrdersGroupedByAccession: function() {
        var self = this;
        var orderGroup = new Bahmni.Clinical.OrdersMapper();
        var accessionNotesMapper = new Bahmni.Clinical.AccessionNotesMapper(this.encounterConfig);
        var accessions = orderGroup.group(this.labOrders, 'accessionUuid');
        accessions.forEach(function(accession) {
            accession.displayList = accession.orders.reduce(function(accessionDisplayList, order) {
                return accessionDisplayList.concat(order.getDisplayList());
            }, []);
        });

        accessionNotesMapper.map(this.encounters, accessions);

        function mapEncounterDateTime(encounters, accessions) {
            accessions.forEach(function (accession) {
                encounters.forEach(function (encounter) {
                    if (encounter.encounterUuid === accession.accessionUuid) {
                        accession.encounterDateTime = encounter.encounterDateTime;
                    }
                });
            });
        }

        mapEncounterDateTime(this.encounters, accessions);

        return _.sortBy(accessions,function (accession) {
            return accession.encounterDateTime;
        }).reverse();
    },
    toggleLabInvestigation : function () {
        this.showLabInvestigations = !this.showLabInvestigations;
    },
    getLatestDiagnoses: function(){
        return _.uniq(this.diagnoses, function(diagnosis){ return diagnosis.getDisplayName(); });
    }
};

Bahmni.Clinical.Visit.create = function (encounterTransactions, consultationNoteConcept, labOrderNoteConcept, encounterConfig, allTestAndPanelsConcept, obsIgnoteList, visitUuid) {
    var diagnosisMapper = new Bahmni.DiagnosisMapper(),
        ordersMapper = new Bahmni.Clinical.OrdersMapper(),
        isLabTests = function (order) {
            var labTestOrderTypeUuid = encounterConfig.orderTypes[Bahmni.Clinical.Constants.labOrderType];
            return order.orderTypeUuid === labTestOrderTypeUuid;
        },
        isNonLabTests = function (order) {
            return !isLabTests(order);
        },
        conceptMatches = function (observation, concepts) {
            return concepts.some(function (concept) {
                return observation.concept.uuid === concept.uuid;
            });
        },
        isConsultationNote = function (observation) {
            return conceptMatches(observation, [consultationNoteConcept])
        },
        isOtherObservation = function (observation) {
            return !conceptMatches(observation, [consultationNoteConcept, labOrderNoteConcept])
        },
        doesNotHaveOrder = function(obs){
            return !obs.orderUuid;
        };

    var radiologyOrders = [];
    encounterTransactions.forEach(function (encounterTransaction) {
        if (encounterTransaction.encounterTypeUuid == encounterConfig.getRadiologyEncounterTypeUuid()) {
            _.pull(encounterTransactions, encounterTransaction);
            encounterTransaction.observations.forEach(function (observation) {
                observation.groupMembers.forEach(function (member) {
                    if (member.concept.name == Bahmni.Common.Constants.documentsConceptName) {
                        radiologyOrders.push({concept: observation.concept, src: Bahmni.Common.Constants.documentsPath + '/' + member.value, dateTime: observation.observationDateTime, provider: encounterTransaction.providers[0]});
                    }
                });
            });
        }
    });

    var removeUnwantedObs = function(observation) {
        return !obsIgnoteList.some(function(ignoredObsName) {return ignoredObsName === observation.concept.name;});
    };
    var allObs = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions).filter(removeUnwantedObs);
    var drugOrders = ordersMapper.map(encounterTransactions, 'drugOrders');
    var testOrders = ordersMapper.map(encounterTransactions, 'testOrders', allTestAndPanelsConcept);
    var otherInvestigations = testOrders.filter(isNonLabTests);
    var labOrders = testOrders.filter(isLabTests).map(Bahmni.Clinical.LabOrder.create);

    var consultationNotes = allObs.filter(isConsultationNote);
    var observations = allObs.filter(isOtherObservation).filter(doesNotHaveOrder);
    var diagnoses = _.flatten(encounterTransactions, 'bahmniDiagnoses').map(diagnosisMapper.mapDiagnosis);

    var dispositions = [];
    angular.forEach(encounterTransactions, function (encounterTransaction) {
        if (encounterTransaction.disposition) {
            encounterTransaction.disposition.provider = encounterTransaction.providers[0];
            dispositions.push(encounterTransaction.disposition);
        }
    });

    return new this(encounterTransactions, drugOrders, consultationNotes, otherInvestigations, observations, diagnoses, dispositions, labOrders, encounterConfig, radiologyOrders, allTestAndPanelsConcept, visitUuid);
};
