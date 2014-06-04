Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

    var findInSavedObservation = function (concept, observations) {
        return _.filter(observations, function (obs) {
            return obs && obs.concept && concept.uuid === obs.concept.uuid;
        });
    };

    var mapObservationGroupMembers = function (observations, conceptSetMembers, conceptSetConfig) {
        var observationGroupMembers = [];
        conceptSetMembers.forEach(function (memberConcept) {
            var savedObservations = findInSavedObservation(memberConcept, observations);
            var configForConcept = conceptSetConfig[memberConcept.name.name] || {};
            var numberOfNodes = configForConcept.multiple || 1; 
            for(var i =0; i < savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, savedObservations[i], conceptSetConfig))
            }
            for(var i =0; i < numberOfNodes - savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, null, conceptSetConfig))
            }
        });
        return observationGroupMembers;
    };

    // tODO : remove conceptUIConfig
    var newObservation = function (concept, savedObs, conceptSetConfig, mappedGroupMembers) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.name.name, possibleAnswers: concept.answers, groupMembers: mappedGroupMembers};
        return new Bahmni.ConceptSet.Observation(observation, savedObs, conceptSetConfig, mappedGroupMembers);
    };

    // tODO : remove conceptUIConfig
    var newObservationNode = function (concept, savedObsNode, conceptSetConfig, mappedGroupMembers) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.name.name, possibleAnswers: concept.answers, groupMembers: mappedGroupMembers};
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig);
    };

    var mapObservation = function (concept, savedObs, conceptSetConfig) {
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode)) 
            return savedObs;
        var mappedGroupMembers = concept.set ? mapObservationGroupMembers(savedObs ? savedObs.groupMembers : [], concept.setMembers, conceptSetConfig) : [];
        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            return newObservationNode(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        } else {
            return newObservation(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        }
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        var savedObs = findInSavedObservation(rootConcept, observations)[0];
        return mapObservation(rootConcept, savedObs, conceptSetConfig || {});
    };

    this.getObservationsForView = function (observations) {
        return internalMapForDisplay(observations);
    };

    var internalMapForDisplay = function (observations) {
        var observationsForDisplay = [];

        var createObservationForDisplay = function (observationTemp, obsConcept) {
            if (observationTemp.value === null || observationTemp.value === undefined || observationTemp === "") {
                return;
            }
            var observationValue = observationTemp.value.name ? observationTemp.value.name : observationTemp.value;

            if (observationTemp.duration) {
                var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(observationTemp.duration.value);
                if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
                    observationValue = observationValue.concat(" since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"]);
                }
            }

            return { "value": observationValue, "abnormal": observationTemp.abnormal, "duration": observationTemp.duration,
                "provider": observationTemp.provider ? observationTemp.provider.name : "",
                "observationDateTime": observationTemp.observationDateTime, "concept": obsConcept};
        }

        _.forEach(observations, function (savedObs) {
            if (savedObs.concept.conceptClass && (savedObs.concept.conceptClass === Bahmni.Common.Constants.conceptDetailsClassName || savedObs.concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName)) {
                var observationNode = new Bahmni.ConceptSet.ObservationNode(savedObs, savedObs, []);
                var obsToDisplay = createObservationForDisplay(observationNode, observationNode.primaryObs.concept);
                if (obsToDisplay)
                    observationsForDisplay.push(obsToDisplay);
            } else {
                if (!savedObs.concept.set) {
                    var observationTemp = newObservation(savedObs.concept, savedObs, []);
                    var obsToDisplay = createObservationForDisplay(observationTemp, observationTemp.concept);
                    if (obsToDisplay)
                        observationsForDisplay.push(obsToDisplay);
                } else {
                    var groupMemberObservationsForDisplay = internalMapForDisplay(savedObs.groupMembers);
                    observationsForDisplay = observationsForDisplay.concat(groupMemberObservationsForDisplay);
                }
            }
        });
        return observationsForDisplay;
    }

};
