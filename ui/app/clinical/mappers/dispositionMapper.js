Bahmni.DispositionMapper = function(encounterConfig) {
    var getMappingCode = function(concept){
        var mappingCode="";
        if(concept.mappings){
            concept.mappings.forEach(function(mapping){
                var mappingSource = mapping.display.split(":")[0];
                if(mappingSource === Bahmni.Common.Constants.emrapiConceptMappingSource){
                    mappingCode = $.trim(mapping.display.split(":")[1]);;
                }
            });
        }
        return mappingCode;
    }

    this.map = function(visit) {
        var dispositions= [];

        visit.encounters.forEach(function(opdEncounter){
            var dispositionObsGroup = opdEncounter.obs.filter(function(observation){
                return  observation.concept ? observation.concept.name.name == Bahmni.Common.Constants.dispositionGroupConcept :false;
            })[0];

            if(!dispositionObsGroup) return;
            var disposition = {};

            dispositionObsGroup.groupMembers.forEach(function(dispositionGroupMember){
                var conceptName =  dispositionGroupMember.concept ? dispositionGroupMember.concept.name.name :null;
                if(conceptName && conceptName === Bahmni.Common.Constants.dispositionConcept){
                    disposition.adtName= dispositionGroupMember.value.name.display;
                    disposition.adtCode= getMappingCode(dispositionGroupMember.value)
                    disposition.adtValueUuid = dispositionGroupMember.value.uuid;
                    var d = Bahmni.Common.Util.DateUtil.parse(dispositionGroupMember.obsDatetime);
                    disposition.adtDateTime = d.toDateString() +" "+d.getHours()+":"+d.getMinutes();
                }
                else if(conceptName && conceptName === Bahmni.Common.Constants.dispositionNoteConcept){
                    disposition.adtNoteValue = dispositionGroupMember.value;
                    disposition.adtNoteConcept = dispositionGroupMember.concept.uuid;
                }
            });

            if(disposition.adtName){
                dispositions.push(disposition);
            }
        });

        return {
            dispositions : dispositions
        };
    }
};