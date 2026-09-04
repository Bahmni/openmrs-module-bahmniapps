import PropTypes from "prop-types";
import React, { lazy, Suspense } from "react";
import "./DraftIndicator.scss";

const LazyDraftIndicator = lazy(() => import("@openmrs-mf/ipd/DraftIndicator"));

export function DraftIndicator({ providerUuid }) {
    return (
        <Suspense fallback={<div />}>
            <LazyDraftIndicator providerUuid={providerUuid} />
        </Suspense>
    );
}

DraftIndicator.propTypes = {
    providerUuid: PropTypes.string,
};
