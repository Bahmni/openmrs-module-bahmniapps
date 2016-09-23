'use strict';

Bahmni.ADT.WardDetails = {};


Bahmni.ADT.WardDetails.create = function(details, diagnosisStatus) {
    var detailsMap = {};
    var attributesToCopy = ["Bed", "Name", "Id", "Name", "Age", "District", "Village", "Admission By", "Admission Time", "Disposition By", "Disposition Time", "ADT Notes"];
    var diagnosisProperties = ["Diagnosis", "Diagnosis Certainty", "Diagnosis Order", "Diagnosis Status", "Diagnosis Provider", "Diagnosis Datetime"];
    var hiddenAttributesToCopy = ["Patient Uuid", "Visit Uuid"];

    var copyProperties = function(newObject, oldObject, properties) {
        properties.forEach(function(property){
            newObject[property] = oldObject[property];
        });
        return newObject;
    };

    var removeDuplicateRuledOutDiagnosis = function(rows) {
        rows.forEach(function(row){
            row.Diagnosis = _.reduce(row.Diagnosis,function(selected,diagnosis){
                var status = _.find(selected,function(dgns){
                   return _.isEqual(dgns.Diagnosis,diagnosis.Diagnosis) && _.isEqual(dgns.diagnosisStatus, diagnosis.diagnosisStatus);
                });
                if(!status){
                    selected.push(diagnosis);
                }
                return selected;
            },[]);
        });
        return rows;
    };

    details.forEach(function(detail) {
        detailsMap[detail.Id] = detailsMap[detail.Id] || copyProperties({}, detail, attributesToCopy);
        detailsMap[detail.Id].Diagnosis = detailsMap[detail.Id].Diagnosis || [];
        if(detail.Diagnosis !== undefined) {
            var diagnosis = copyProperties({}, detail, diagnosisProperties);
            if(diagnosis["Diagnosis Status"] === diagnosisStatus.ruledOut.concept.name) {
                diagnosis.ruledOut = true;
                diagnosis.diagnosisStatus = diagnosisStatus.ruledOut;
            }
            if(diagnosis["Diagnosis Status"] === diagnosisStatus.cured.concept.name){
                diagnosis.cured = true;
                diagnosis.diagnosisStatus = diagnosisStatus.cured;
            }
            detailsMap[detail.Id].Diagnosis.push(diagnosis);
        }
        var hiddenProperties = copyProperties({}, detail, hiddenAttributesToCopy);
        detailsMap[detail.Id].hiddenAttributes = detailsMap[detail.Id].hiddenAttributes || {};
        detailsMap[detail.Id].hiddenAttributes.patientUuid = hiddenProperties["Patient Uuid"];
        detailsMap[detail.Id].hiddenAttributes.visitUuid = hiddenProperties["Visit Uuid"];
    });

    return removeDuplicateRuledOutDiagnosis(_.values(detailsMap));
};
