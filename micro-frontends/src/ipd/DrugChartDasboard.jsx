import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function DrugChartDashboard(props) {
    const LazyApp = lazy(() => import("@openmrs-mf/ipd/Dashboard"));

    return (
        <>
            <Suspense fallback={<p>Loading...</p>}>
                <LazyApp
                    hostData={props.hostData}
                />
            </Suspense>
        </>
    );
}

// Without propTypes, react2angular won't render the component
DrugChartDashboard.propTypes = {
    hostData: PropTypes.shape({
        patientId: PropTypes.string,
        forDate: PropTypes.instanceOf(Date),
    }).isRequired,
};
