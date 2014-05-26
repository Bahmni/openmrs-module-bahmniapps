angular.module('bahmni.clinical')
.filter('primaryDiagnosisFirst', function ($filter) {
    return function(diagnoses) {
        var primaryDiagnoses = _.filter(diagnoses, function(diagnosis) { return diagnosis.isPrimary(); });
        var otherDiagnoses = _.filter(diagnoses, function(diagnosis) { return !diagnosis.isPrimary(); });
        return primaryDiagnoses.concat(otherDiagnoses);
    }
});