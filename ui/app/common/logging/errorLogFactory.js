angular.module('bahmni.common.logging').factory(
    "stacktraceService",
    function () {
        return({
            print: printStackTrace
        });

    }
).provider(
    "$exceptionHandler",
    {
        $get: function (errorLogService) {
            return( errorLogService );
        }
    }
).factory(
    "errorLogService",
    function ($log, $window, stacktraceService) {

        function log(exception, cause) {
            $log.error.apply($log, arguments);
            try {
                var errorMessage = exception.toString();
                var stackTrace = stacktraceService.print({ e: exception });

                $.ajax({
                    type: "POST",
                    url: "/log",
                    contentType: "application/json",
                    data: angular.toJson({
                        timestamp: new Date(),
                        browser: $window.navigator.userAgent,
                        errorUrl: $window.location.href,
                        errorMessage: errorMessage,
                        stackTrace: stackTrace,
                        cause: ( cause || "" )
                    })
                });

            } catch (loggingError) {
                $log.warn("Error logging failed");
                $log.log(loggingError);

            }

        }

        return( log );

    }
);
