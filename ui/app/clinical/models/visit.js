'use strict';

Bahmni.Clinical.Visit = function (encounters, drugOrders, consultationNotes, otherInvestigations, observations, diagnoses, dispositions, labOrders, encounterConfig, radiologyDocs, allTestAndPanels) {
    this.encounters = encounters;
    this.drugOrders = drugOrders;
    this.consultationNotes = consultationNotes;
    this.otherInvestigations = otherInvestigations;
    this.observations = observations;
    this.diagnoses = diagnoses;
    this.dispositions = dispositions;
    this.labOrders = labOrders;
    this.encounterConfig = encounterConfig;
    this.radiologyDocs = radiologyDocs;

    var orderGroup = new Bahmni.Clinical.OrderGroup();
    this.ipdDrugSchedule = this.hasAdmissionEncounter() ? Bahmni.Clinical.DrugSchedule.create(this) : null;
    this.drugOrderGroups = orderGroup.group(drugOrders);
    this.otherInvestigationGroups = orderGroup.group(otherInvestigations);

    var resultGrouper = new Bahmni.Clinical.ResultGrouper()
    var observationGroupingFunction = function (obs) { return obs.observationDateTime.substring(0, 10); };
    this.consultationNoteGroups =  resultGrouper.group(consultationNotes, observationGroupingFunction, 'obs', 'date')
    this.observationGroups =  resultGrouper.group(observations, observationGroupingFunction, 'obs', 'date')
    this.observationGroups.forEach(function(observationGroup){
        observationGroup.obs = new Bahmni.Clinical.CompoundObservation(observationGroup.obs);
    });
    this.labTestOrderObsMap = this.getLabOrdersGroupedByAccession();
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
            return encounter.disposition && encounter.disposition.code === dispositionCode;
        })[0];
    },
    getDischargeDispositionEncounterDate: function() {
        var dischargeDispositionEncounter = this._getEncounterWithDisposition(Bahmni.Common.Constants.dischargeCode);
        return dischargeDispositionEncounter ? new Date(dischargeDispositionEncounter.encounterDateTime) : null;
    },
    getLabOrdersGroupedByAccession: function() {
        var orderGroup = new Bahmni.Clinical.OrderGroup();
        var accessionNotesMapper = new Bahmni.Clinical.AccessionNotesMapper(this.encounterConfig);
        var accessions = orderGroup.group(this.labOrders, 'accessionUuid');
        accessions.forEach(function(accession) {
            accession.displayList= accession.orders.reduce(function(accessionDisplayList, order) {
                return accessionDisplayList.concat(order.displayList);
            }, []);
        });
        accessionNotesMapper.map(this.encounters, accessions);
        return accessions;
    }
};

Bahmni.Clinical.Visit.create = function (encounterTransactions, consultationNoteConcept, labOrderNoteConcept, encounterConfig, allTestAndPanels) {
    var diagnosisMapper = new Bahmni.DiagnosisMapper(),
        orderGroup = new Bahmni.Clinical.OrderGroup(),
        orderObservationsMapper = new Bahmni.Clinical.OrderObservationsMapper(),
        ArrayUtil = Bahmni.Common.Util.ArrayUtil,
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
        allOrders = function(){
            return ArrayUtil.flatten(encounterTransactions, 'testOrders');
        },
        doesNotHaveOrder = function(obs){
            return !allOrders().some(function(order){ return order.uuid === obs.orderUuid; });
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


    var allObs = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
    var drugOrders = orderGroup.flatten(encounterTransactions, 'drugOrders');
    var labOrders = orderGroup.flatten(encounterTransactions, 'testOrders', isLabTests, allTestAndPanels);
    var otherInvestigations = orderGroup.flatten(encounterTransactions, 'testOrders', isNonLabTests, allTestAndPanels);
    var consultationNotes = allObs.filter(isConsultationNote);
    var observations = allObs.filter(isOtherObservation).filter(doesNotHaveOrder);
    orderObservationsMapper.map(allObs, labOrders);
    labOrders.forEach(function(order) { order.displayList = Bahmni.Clinical.TestOrder.create(order, allTestAndPanels).getDisplayList() });
    var diagnoses = ArrayUtil.flatten(encounterTransactions, 'bahmniDiagnoses').map(diagnosisMapper.mapDiagnosis);

    var dispositions = [];
    angular.forEach(encounterTransactions, function (encounterTransaction) {
        if (encounterTransaction.disposition) {
            encounterTransaction.disposition.provider = encounterTransaction.providers[0];
            dispositions.push(encounterTransaction.disposition);
        }
    });

    return new this(encounterTransactions, drugOrders, consultationNotes, otherInvestigations, observations, diagnoses, dispositions, labOrders, encounterConfig, radiologyDocs);
}