Bahmni.DiagnosisMapper = function (consultation) {
    this.mapPastDiagnosis = function (pastDiagnosesResponse) {
        var pastDiagnoses = [];
        pastDiagnosesResponse.forEach(function (pastDiagnosis) {
            if (!presentInList(pastDiagnosis, consultation.diagnosis) && !presentInList(pastDiagnosis, consultation.pastDiagnoses)) {
                if(!pastDiagnosis.codedAnswer){
                    pastDiagnosis.codedAnswer = {
                        name: undefined,
                        uuid: undefined
                    }
                }
                var mappedPastDiagnosis = angular.extend(new Bahmni.Clinical.Diagnosis(), pastDiagnosis);
                mappedPastDiagnosis.setDiagnosisStatus(pastDiagnosis.diagnosisStatusConcept);
                pastDiagnoses.push(mappedPastDiagnosis);
            }
        });
        return pastDiagnoses;
    };

    var presentInList = function (diagnosisToCheck, diagnosisList) {
        if (!diagnosisList) {
            return false;
        }
        return diagnosisList.filter(function (diagnosis) {
            var contains = false;
            if (diagnosisToCheck.freeTextAnswer) {
                contains = diagnosis.freeTextAnswer === diagnosisToCheck.freeTextAnswer;
            }
            else if (diagnosis.codedAnswer && diagnosis.codedAnswer.name) {
                contains = diagnosis.codedAnswer.name === diagnosisToCheck.codedAnswer.name
            }
            return contains;
        })[0];
    };
};
