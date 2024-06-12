import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";
import Loader from "../next-ui/Components/Loader/Loader";

export function IpdDashboard(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/IpdDashboard"));

  return (
    <>
      <Suspense fallback={<Loader />}>
        <LazyApp
          hostData={props.hostData}
          hostApi={props.hostApi}
        />
      </Suspense>
    </>
  );
}

// Without propTypes, react2angular won't render the component
IpdDashboard.propTypes = {
  hostData: PropTypes.object.isRequired,
  hostApi: PropTypes.shape({
    navigation: PropTypes.shape({
      visitSummary: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};
