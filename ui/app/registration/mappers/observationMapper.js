Bahmni.Registration.ObservationMapper = function(){
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

    return this;
}
