Bahmni.Opd.Consultation.VisitSummary = function (encounterTransactions) {
    var self = this;
    self.encounterTransactions = encounterTransactions;

    self.diagnoses = (function(){
        var diagnoses = [];
        angular.forEach(self.encounterTransactions, function(encounterTransaction){
            angular.forEach(encounterTransaction.diagnoses, function(diagnosis){
                diagnosis.provider = encounterTransaction.providers[0];
                diagnoses.push(diagnosis);
            });
        });
        return diagnoses;
    })();

    self.dispositions = (function(){
        var dispositions = [];
        angular.forEach(self.encounterTransactions, function(encounterTransaction){
            if(encounterTransaction.disposition) {
                encounterTransaction.disposition.provider = encounterTransaction.providers[0];
                dispositions.push(encounterTransaction.disposition);
            }
        })
        return dispositions;
    })();

    var encountersInAscendingOrder = encounterTransactions.slice(0).sort(function(e1, e2){ return e1.encounterDateTime > e2.encounterDateTime; })
    var mostRecentEncounter = encountersInAscendingOrder[encountersInAscendingOrder.length - 1];
    var firstEncounter = encountersInAscendingOrder[0];

    self.visitStartDateTime = new Date(firstEncounter.encounterDateTime);
    self.mostRecentEncounterDateTime = new Date(mostRecentEncounter.encounterDateTime);

    self.isConfirmedDiagnosis = function(certainity){
        return certainity === 'CONFIRMED';
    }

    self.isPrimaryOrder = function(order){
        return order === 'PRIMARY';
    }

    self.hasDiagnosis = function(){
        return self.diagnoses.length > 0;
    }

    self.hasDisposition = function(){
        return self.dispositions.length > 0;
    }

    self.numberOfDosageDaysForDrugOrder = function(drugOrder) {
        return Math.floor((new Date(drugOrder.endDate) - new Date(drugOrder.startDate)) / (60 * 1000 * 60 * 24))
    }
};