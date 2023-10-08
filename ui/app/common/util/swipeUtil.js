'use strict';
Bahmni.Common.Util.SwipeUtil = {
    DIRECTIONS: {
        TOP: "top",
        BOTTOM: "bottom",
        LEFT: "left",
        RIGHT: "right"
    },
    detectSwipe: function (callback) {
        // eslint-disable-next-line angular/document-service
        document.addEventListener('touchstart', handleTouchStart, false);
        // eslint-disable-next-line angular/document-service
        document.addEventListener('touchmove', handleTouchMove, false);

        const directions = Bahmni.Common.Util.SwipeUtil.DIRECTIONS;

        var xDown = null;
        var yDown = null;

        function getTouches (evt) {
            return evt.touches || evt.originalEvent.touches;
        }

        function handleTouchStart (evt) {
            const firstTouch = getTouches(evt)[0];
            xDown = firstTouch.clientX;
            yDown = firstTouch.clientY;
        }

        function handleTouchMove (evt) {
            if (!xDown || !yDown) {
                return;
            }

            var xDiff = xDown - getTouches(evt)[0].clientX;
            var yDiff = yDown - getTouches(evt)[0].clientY;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > 0) {
                    callback(evt, directions.RIGHT);
                } else {
                    callback(evt, directions.LEFT);
                }
            } else {
                if (yDiff > 0) {
                    callback(evt, directions.BOTTOM);
                } else {
                    callback(evt, directions.TOP);
                }
            }

            xDown = null;
            yDown = null;
        }
    }
};
