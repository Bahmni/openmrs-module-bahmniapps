var Bahmni = Bahmni || {};
Bahmni.DocumentUpload = Bahmni.DocumentUpload || {};

Bahmni.DocumentUpload.Constants = (function () {
    return {
        visitRepresentation: "custom:(uuid,startDatetime,stopDatetime,visitType,patient,encounters:(uuid,encounterType,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(id,uuid,value,concept,obsDatetime,groupMembers:(id,uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(id,uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(id,uuid,concept:(uuid,name),value:(uuid,name)))))))"
    };
})();


