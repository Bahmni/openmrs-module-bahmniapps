Bahmni.Opd.DispositionMapper = function(encounterConfig) {
    this.map = function(visit) {
        var opdEncounters = visit.encounters.filter(function(encounter){
            return encounter.encounterType.uuid === encounterConfig.encounterTypes.OPD;
        });


        var dispositions= [];

        if (opdEncounters) {
            opdEncounters.forEach(function(opdEncounter){
                var dispositionObsGroup = opdEncounter.obs.filter(function(observation){
                    return  observation.concept ? observation.concept.name.name == Bahmni.Opd.Constants.dispositionGroupConcept :false;
                })[0];


                var getMappingCode = function(concept){
                    var mappingCode="";
                    if(concept.mappings){
                        concept.mappings.forEach(function(mapping){
                            var mappingSource = mapping.display.split(":")[0];
                            if(mappingSource === Bahmni.Opd.Constants.emrapiConceptMappingSource){
                                mappingCode = mapping.display.split(":")[1].trim();;
                            }
                        });
                    }
                    return mappingCode;
                }

                if(dispositionObsGroup){
                    var disposition = {};

                    dispositionObsGroup.groupMembers.forEach(function(dispositionGroupMember){
                        var conceptName =  dispositionGroupMember.concept ? dispositionGroupMember.concept.name.name :null;
                        if(conceptName && conceptName === Bahmni.Opd.Constants.dispositionConcept){
                            disposition.adtName= dispositionGroupMember.value.display;
                            disposition.adtCode= getMappingCode(dispositionGroupMember.value)
                            disposition.adtValueUuid = dispositionGroupMember.value.uuid;
                            disposition.adtDateTime = dispositionGroupMember.obsDatetime;
                        }
                        else if(conceptName && conceptName === Bahmni.Opd.Constants.dispositionNoteConcept){
                            disposition.adtNoteValue = dispositionGroupMember.value;
                            disposition.adtNoteConcept = dispositionGroupMember.concept.uuid;
                        }
                    });

                    if(disposition.adtName){
                        dispositions.push(disposition);
                    }
                }

            })

        }
        else {
            return;
        };

        return {
            dispositions : dispositions
        };
    }
};
