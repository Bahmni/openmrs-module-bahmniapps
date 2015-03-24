'use strict';

Bahmni.ADT.WardDetails = {};
Bahmni.ADT.WardDetails.create = function(details) {
    var attributesToCopy = ["Bed", "Name", "Id", "Name", "Age", "County District", "Village", "Admission By", "Admission Time", "Disposition By", "Disposition Time"];
    var diagnosisProperties = ["Diagnosis", "Diagnosis Certainty", "Diagnosis Order", "Diagnosis Status", "Diagnosis Provider", "Diagnosis Datetime"];
    var detailsMap = {};

    var copyProperties = function(newObject, oldObject, properties) {
        properties.forEach(function(property){
            newObject[property] = oldObject[property];
        });
        return newObject;
    }

    details.forEach(function(detail) {
        detailsMap[detail.Id] = detailsMap[detail.Id] || copyProperties({}, detail, attributesToCopy);
        detailsMap[detail.Id].DiagnosisList = detailsMap[detail.Id].DiagnosisList || [];
        if(detail.Diagnosis != null) {
            var diagnosis = copyProperties({}, detail, diagnosisProperties);
            diagnosis.ruledOut = diagnosis["Diagnosis Status"] == "Ruled Out Diagnosis";
            detailsMap[detail.Id].DiagnosisList.push(diagnosis);
        }
        
    });
    return _.values(detailsMap);
}
