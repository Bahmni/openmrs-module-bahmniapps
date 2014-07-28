'use strict';

Bahmni.Clinical.VisitDiagnosis = (function () {

    var VisitDiagnosis = function (diagnoses) {
        this.diagnoses = diagnoses;
    };
    VisitDiagnosis.prototype = {
        isConfirmedDiagnosis: function (certainity) {
            return certainity === 'CONFIRMED';
        }
    };

    VisitDiagnosis.create = function (encounterTransactions) {
        var diagnosisMapper = new Bahmni.DiagnosisMapper();
        var diagnoses = _.flatten(encounterTransactions, 'bahmniDiagnoses').map(diagnosisMapper.mapDiagnosis)
        diagnoses = _.uniq(diagnoses, function (diagnosis) {
            return diagnosis.getDisplayName();
        });
        return new this(diagnoses);
    };


    return VisitDiagnosis;
})();