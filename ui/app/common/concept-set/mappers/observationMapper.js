Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
    var dateUtil = Bahmni.Common.Util.DateUtil;

    this.getObservationsForView = function (observations) {
        return internalMapForDisplay(observations);
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        var savedObs = findInSavedObservation(rootConcept, observations)[0];
        return mapObservation(rootConcept, savedObs, conceptSetConfig || {});
    };


    this.forView = function (bahmniObservations) {
        var sortWeight = 0;
        return  _.map(bahmniObservations, function (bahmniObservation) {
            var observationValue = bahmniObservation.value;
            if (bahmniObservation.duration) {
                var durationForDisplay = dateUtil.convertToUnits(bahmniObservation.duration);
                if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
                    observationValue = observationValue.concat(" since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"]);
                }
            }

            return { "value": observationValue, "abnormal": bahmniObservation.isAbnormal, "duration": bahmniObservation.duration,
                "provider": "default_provider_needs_fix", "observationDateTime": bahmniObservation.time, "encounterDateTime": bahmniObservation.encounterTime,
                "concept": bahmniObservation.concept, "unit": bahmniObservation.unit, "type": bahmniObservation.type,
                "rootConcept": bahmniObservation.rootConcept, "sortWeight": bahmniObservation.conceptSortWeight };
        });
    };

    var findInSavedObservation = function (concept, observations) {
        return _.filter(observations, function (obs) {
            return obs && obs.concept && concept.uuid === obs.concept.uuid;
        });
    };

    var mapObservation = function (concept, savedObs, conceptSetConfig) {
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode))
            return savedObs;
        var mappedGroupMembers = concept.set ? mapObservationGroupMembers(savedObs ? savedObs.groupMembers : [], concept, conceptSetConfig) : [];
        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            return newObservationNode(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        } else {
            return newObservation(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        }
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
        var displayLabel = conceptSetConfig[concept.name.name] && conceptSetConfig[concept.name.name]["label"];
        var comment = savedObs ? savedObs.comment : null;
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: displayLabel || concept.name.name, possibleAnswers: concept.answers, groupMembers: mappedGroupMembers, comment: comment};

        return new Bahmni.ConceptSet.Observation(observation, savedObs, conceptSetConfig, mappedGroupMembers);
    };

    // TODO : remove conceptUIConfig
    var newObservationNode = function (concept, savedObsNode, conceptSetConfig, mappedGroupMembers) {
        var comment = savedObsNode ? savedObsNode.comment : null;
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.name.name, possibleAnswers: concept.answers, groupMembers: mappedGroupMembers, comment: comment};
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig);
    };

    var internalMapForDisplay = function (observations) {
        var observationsForDisplay = [];

        var createObservationForDisplay = function (observationTemp, obsConcept) {
            if (observationTemp.value === null || observationTemp.value === undefined || observationTemp === "") {
                return;
            }
            var observationValue = null;

            var shortName = _.first(_.filter(observationTemp.value.names, function (name) {
                return name.conceptNameType === 'SHORT';
            }));
            if (shortName) { // for new observations - uses the webservices-rest contract!!!
                observationValue = shortName.name;
            } else if (observationTemp.value.shortName) { // for saved observations - uses the encountertransaction contract!!!
                observationValue = observationTemp.value.shortName;
            } else if (observationTemp.value.name) {
                observationValue = observationTemp.value.name;
            } else {
                observationValue = observationTemp.value;
            }

            if (observationTemp.duration) {
                var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(observationTemp.duration.value);
                if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
                    observationValue = observationValue.concat(" since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"]);
                }
            }

            return { "value": observationValue, "abnormal": observationTemp.abnormal, "duration": observationTemp.duration,
                "provider": observationTemp.provider ? observationTemp.provider.name : "",
                "observationDateTime": observationTemp.observationDateTime, "concept": obsConcept, comment: observationTemp.comment, uuid: observationTemp.uuid};
        };


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
