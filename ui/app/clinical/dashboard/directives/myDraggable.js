"use strict";

angular.module('bahmni.clinical', [])
    .directive('myDraggable', ['$document', '$window', function ($document, $window) {
        const link = function (scope, elmnt, attributes) {
            var pos1 = 0;
            var pos2 = 0;
            var pos3 = 0;
            var pos4 = 0;

            const dragMouseDown = function (e) {
                e = e || $window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                $document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                $document.onmousemove = elementDrag;
            };

            const elementDrag = function (e) {
                e = e || $window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            };

            const closeDragElement = function () {
                /* stop moving when mouse button is released: */
                $document.onmouseup = null;
                $document.onmousemove = null;
            };

            if ($document.getElementById(elmnt.id + "header")) {
                $document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
            } else {
                elmnt.onmousedown = dragMouseDown;
            }
        };
        return {
            restrict: 'A',
            link: link
        };
    }]);
