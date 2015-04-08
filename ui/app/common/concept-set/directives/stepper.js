angular.module('bahmni.common.conceptSet')
    .directive('stepper', function () {
    return {
        restrict:'E',
        require: 'ngModel',
        replace : true,
        scope:{ ngModel : '=',
        obs : '=',
        ngClass: '=',
        focusMe: '='
        },
        template: '<div class="stepper"><input id="{{::obs.uniqueId}}" obs-constraints ng-model="ngModel" obs="obs" ng-class="ngClass" focus-me="focusMe" integer="true" type="text" class="stepper__field"  />'+
                             '<button ng-click="decrement()" ng-class="ngClass" class="stepper__btn stepper__minus">-</button>'+
                             '<button ng-click="increment()" ng-class="ngClass" class="stepper__btn stepper__plus">+</button></div> ',

    link:function(scope, element, attrs, ngModelController){

 // Specify how UI should be updated
        ngModelController.$render = function() {
//          element.html(ngModelController.$viewValue || '');
        };

            // when model change, cast to integer
            ngModelController.$formatters.push(function(value) {
                return parseInt(value, 10);
            });

            // when view change, cast to integer
            ngModelController.$parsers.push(function(value) {
                return parseInt(value, 10);
            });

            scope.increment = function(){
                if (scope.obs.concept.hiNormal != null){
                    var currValue = (isNaN(ngModelController.$viewValue)? 0 : ngModelController.$viewValue);
                     if(currValue<scope.obs.concept.hiNormal) {
                        updateModel(+1);
                     }
                }else{
                    updateModel(+1);
                }
            }
            scope.decrement = function(){
                if (scope.obs.concept.lowNormal != null){
                var currValue = (isNaN(ngModelController.$viewValue)? 0 : ngModelController.$viewValue);
                 if(currValue>scope.obs.concept.lowNormal) {
                    updateModel(-1);
                }
                }else{
                    updateModel(-1);
                }
            }
            function updateModel(offset) {
                    var currValue = 0;
                    if(isNaN(ngModelController.$viewValue)){
                        if (scope.obs.concept.lowNormal != null) {
                            currValue = scope.obs.concept.lowNormal - offset; //To mention the start point for Plus And Minus
                            // if - or + is pressed on empty field, set them with low value or 0
                        }
                    }else{
                        currValue = parseInt(ngModelController.$viewValue);
                    }
                    ngModelController.$setViewValue(currValue+ offset);

            }
         }
    };
});