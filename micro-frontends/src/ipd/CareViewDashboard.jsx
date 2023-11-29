import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function CareViewDashboard(props) {
    const LazyApp = lazy(() => import("@openmrs-mf/ipd/CareViewDashboard"));

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
CareViewDashboard.propTypes = {
    hostData: PropTypes.shape({
        patientId: PropTypes.string,
    }).isRequired,
};
