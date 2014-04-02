var observationMapper = function(){
    this.map = function(savedObservations){
        var observations ={
            regularObservations:[],
            compoundObservations:[]
        };

        savedObservations.forEach(function(obs){
            if(obs && (obs.concept.name ===  Bahmni.Common.Constants.compoundObservationConceptName)){
                observations.compoundObservations.push(obs);
            }
            else if(obs){
                observations.regularObservations.push(obs);
            }
        });
        return observations;
    }

    this.findObservation = function(conceptName,observations){
        var result = observations.filter(function(obs){
            return obs && obs.groupMembers[0] && obs.groupMembers[0].concept.name === conceptName;
        });
        return result;
    }
    return this;
}
