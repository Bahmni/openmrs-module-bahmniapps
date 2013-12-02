Bahmni.Opd.Consultation.Visit = function (encounterTransactions) {
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
};