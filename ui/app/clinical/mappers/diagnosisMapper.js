Bahmni.DiagnosisMapper = function(consultation, ruledOutDiagnoses) {

    this.mapPastDiagnosis = function (pastDiagnosesResponse) {
        var pastDiagnoses = [];
        pastDiagnosesResponse.forEach(function(pastDiagnosis){
            if (!presentInList(pastDiagnosis, consultation.diagnosis)&& !presentInList(pastDiagnosis, consultation.pastDiagnoses)) {
                if (hasLatestRuledOutObservation(pastDiagnosis)){
                    pastDiagnosis.certainty = Bahmni.Common.Constants.ruledOutCertainty;
                }
                pastDiagnoses.push(pastDiagnosis);
            }
        });
        return pastDiagnoses;
    };

    var presentInList = function (diagnosisToCheck, diagnosisList) {
        if(!diagnosisList){
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

    var hasLatestRuledOutObservation = function(diagnosis){
        if (!ruledOutDiagnoses)
            return false;

        var sortedRuledOutObservation = getLatestBy(ruledOutDiagnoses, "obsDatetime", function (ruledOutDiagnosis) {
            return ruledOutDiagnosis.value.uuid == diagnosis.codedAnswer.uuid;
        });

        if (!sortedRuledOutObservation) return false;

        return sortedRuledOutObservation["obsDatetime"] > diagnosis.diagnosisDateTime;
    };

    var getLatestBy = function(list, comparatorField, matcher){
        var allRuledOutDiagnosisObservation = list.filter(matcher);
        if (allRuledOutDiagnosisObservation.length == 0) {
            return ;
        }

        var sortedRuledOutObservations = allRuledOutDiagnosisObservation.sort(function(a, b){
            var x = a[comparatorField];
            var y = b[comparatorField];
            return ( (x < y) ? -1 : (x > y ? 1 : 0));
        });

        if (sortedRuledOutObservations.length == 0) {
            return undefined;
        }
        return sortedRuledOutObservations[0];
    };
}
