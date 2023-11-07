import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function DrugChartSlider(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/DrugChartSlider"));

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
DrugChartSlider.propTypes = {
  hostData: PropTypes.shape({
    drugOrder: PropTypes.object,
    patientId: PropTypes.string,
    scheduleFrequencies: PropTypes.array,
    startTimeFrequencies: PropTypes.array,
    enable24HrTimeFormat: PropTypes.bool,
  }).isRequired,
  hostApi: PropTypes.shape({
    onModalClose: PropTypes.func,
    onModalSave: PropTypes.func,
    onModalCancel: PropTypes.func,
  }).isRequired,
};
