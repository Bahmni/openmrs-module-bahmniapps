Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
    var dateUtil = Bahmni.Common.Util.DateUtil;

    // TODO : Shouldn't this be in clinical module. Don't see a reason for this to be in concept-set code - Shruthi
    this.getObservationsForView = function (observations, conceptSetConfig) {
        return internalMapForDisplay(observations, conceptSetConfig);
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        var savedObs = findInSavedObservation(rootConcept, observations)[0];
        return mapObservation(rootConcept, savedObs, conceptSetConfig || {});
    };


    // TODO : Shouldn't this be in clinical module. Don't see a reason for this to be in concept-set code - Shruthi
    this.forView = function (bahmniObservations) {
        var sortWeight = 0;
        return  _.map(bahmniObservations, function (bahmniObservation) {
            var observationValue = bahmniObservation.value;
            observationValue = bahmniObservation.duration ? observationValue + " " + getDurationDisplayValue(bahmniObservation.duration) : observationValue;

            return { "value": observationValue, "abnormal": bahmniObservation.isAbnormal, "duration": bahmniObservation.duration, 
                "provider": "default_provider_needs_fix", "observationDateTime": bahmniObservation.time, "encounterDateTime": bahmniObservation.encounterTime,
                "concept": bahmniObservation.concept, "conceptShortName" : bahmniObservation.conceptShortName, "unit": bahmniObservation.unit, "type": bahmniObservation.type,
                "rootConcept": bahmniObservation.rootConcept, "sortWeight": bahmniObservation.conceptSortWeight };
        });
    };

    var findInSavedObservation = function (concept, observations) {
        return _.filter(observations, function (obs) {
            return obs && obs.concept && concept.uuid === obs.concept.uuid;
        });
    };

    var mapObservation = function (concept, savedObs, conceptSetConfig) {
        var obs = null;
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode))
            return savedObs;
        var mappedGroupMembers = concept.set ? mapObservationGroupMembers(savedObs ? savedObs.groupMembers : [], concept, conceptSetConfig) : [];

        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            obs = newObservationNode(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        } else {
            obs = newObservation(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        }

        new Bahmni.ConceptSet.MultiSelectObservations(conceptSetConfig).map(mappedGroupMembers, obs);
        return obs;
    };

    var mapObservationGroupMembers = function (observations, parentConcept, conceptSetConfig) {
        var observationGroupMembers = [];
        var conceptSetMembers = parentConcept.setMembers;
        conceptSetMembers.forEach(function (memberConcept) {
            var savedObservations = findInSavedObservation(memberConcept, observations);
            var configForConcept = conceptSetConfig[memberConcept.name.name] || {};
            var numberOfNodes = configForConcept.multiple || 1;
            for (var i = 0; i < savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, savedObservations[i], conceptSetConfig))
            }
            for (var i = 0; i < numberOfNodes - savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, null, conceptSetConfig))
            }
        });

        return observationGroupMembers;
    };


    // tODO : remove conceptUIConfig
    var newObservation = function (concept, savedObs, conceptSetConfig, mappedGroupMembers) {
        var observation = buildObservation(concept, savedObs, mappedGroupMembers);
        return new Bahmni.ConceptSet.Observation(observation, savedObs, conceptSetConfig, mappedGroupMembers);
    };

    // TODO : remove conceptUIConfig
    var newObservationNode = function (concept, savedObsNode, conceptSetConfig, mappedGroupMembers) {
        var observation = buildObservation(concept, savedObsNode, mappedGroupMembers);
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig);
    };

    function buildObservation(concept, savedObs, mappedGroupMembers) {
        var conceptName = _.find(concept.names, {conceptNameType: "SHORT"}) || _.find(concept.names, {conceptNameType: "FULLY_SPECIFIED"});
        var displayLabel = conceptName ? conceptName.name : concept.shortName || concept.name.name ; // TODO : concept is either from webservice or encounter transaction
        var comment = savedObs ? savedObs.comment : null;
        return { concept: conceptMapper.map(concept), units: concept.units, label: displayLabel, possibleAnswers: concept.answers, groupMembers: mappedGroupMembers, comment: comment};
    }

    var createObservationForDisplay = function (observation, concept) {
        if (!observation.value) return;
        var observationValue = getObservationDisplayValue(observation);
        observationValue = observation.duration ? observationValue + " " + getDurationDisplayValue(observation.duration) : observationValue;
        return { "value": observationValue, "abnormal": observation.abnormal, "duration": observation.duration,
            "provider": observation.provider ? observation.provider.name : "",
            "observationDateTime": observation.observationDateTime, "concept": concept,
            "comment": observation.comment, "uuid": observation.uuid};
    };

    var getObservationDisplayValue = function(observation) {
        return observation.value.shortName || observation.value.name || observation.value;
    }

    var getDurationDisplayValue = function(duration) {
        var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(duration.value);
        if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
            return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
        }
    }

    var getGridObservationDisplayValue = function(observation) { 
        var memberValues = _.map(observation.groupMembers, function(member){
            return getObservationDisplayValue(member);
        });
        return memberValues.join(', ');
    }


    var internalMapForDisplay = function (observations, conceptSetConfig) {
        var observationsForDisplay = [];
        _.forEach(observations, function (savedObs) {
            if (savedObs.concept.conceptClass && (savedObs.concept.conceptClass === Bahmni.Common.Constants.conceptDetailsClassName || savedObs.concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName)) {
                var observationNode = new Bahmni.ConceptSet.ObservationNode(savedObs, savedObs, []);
                var obsToDisplay = createObservationForDisplay(observationNode, observationNode.primaryObs.concept);
                if (obsToDisplay) observationsForDisplay.push(obsToDisplay);
            } else {
                if (savedObs.concept.set) {
                    if(conceptSetConfig[savedObs.concept.name] && conceptSetConfig[savedObs.concept.name].grid) {
                        savedObs.value = getGridObservationDisplayValue(savedObs);
                        observationsForDisplay = observationsForDisplay.concat(createObservationForDisplay(savedObs, savedObs.concept))
                    }
                    else {
                        var groupMemberObservationsForDisplay = internalMapForDisplay(savedObs.groupMembers, conceptSetConfig);
                        observationsForDisplay = observationsForDisplay.concat(groupMemberObservationsForDisplay);
                    }
                } else {
                    var observation = newObservation(savedObs.concept, savedObs, []);
                    var obsToDisplay = createObservationForDisplay(observation, observation.concept);
                    if (obsToDisplay) observationsForDisplay.push(obsToDisplay);
                }
            }
        });
        return observationsForDisplay;
    }

};
