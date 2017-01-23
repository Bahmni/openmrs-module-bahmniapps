'use strict';

Bahmni.Clinical.ComponentContext = function (name,props) {
    this.name = name;
    this.props = props;
};

Bahmni.Clinical.ComponentContext.prototype = {
    getName: function () {
        return this.name;
    },
    getProps: function(){
        return this.props;
    },
    onValueChanged: function(obs){
        console.log(obs)
    }

};
