'use strict';
Bahmni.Common.Util.FormFieldPathUtil = {
    getFormNameAndVersion: function(path){
       let formNameAndVersion= (path.split("/")[0]).split('.');
       return{
           formName: formNameAndVersion[0],
           formVersion : formNameAndVersion[1]
       }
    }
}