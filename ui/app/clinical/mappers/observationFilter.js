Bahmni.ObservationFilter = function () {
	var self = this;

	self.voidIfNull = function(observation){
		if(observation.groupMembers.length > 0){
			observation.groupMembers.forEach(function(obsMember){
				self.voidIfNull(obsMember)
			})
		}
		else if(observation.uuid && !observation.value){
			observation.voided=true;
		}
	}
}