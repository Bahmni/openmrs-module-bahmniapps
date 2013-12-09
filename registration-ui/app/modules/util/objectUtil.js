Bahmni.Registration.Util.ObjectUtil = {
	slice: function(obj, propertyNames) {
		var newObj = {};
		angular.forEach(propertyNames, function(propertyName){
			newObj[propertyName] = obj[propertyName];
		});
		return newObj;
	}
}