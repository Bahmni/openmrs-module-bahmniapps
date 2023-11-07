import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function DrugChartSliderNotification(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/DrugChartSliderNotification"));

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <LazyApp
          hostData={props.hostData}
          hostApi={props.hostApi}
        />
      </Suspense>
    </>
  );
}

// Without propTypes, react2angular won't render the component
DrugChartSliderNotification.propTypes = {
  hostData: PropTypes.shape({
    notificationKind: PropTypes.string,
  }).isRequired,
  hostApi: PropTypes.shape({
    onClose: PropTypes.func,
  }).isRequired,
};
