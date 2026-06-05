import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
} from "carbon-components-react";
import { ChevronDown16, ChevronUp16 } from "@carbon/icons-react";
import { FormattedMessage, useIntl } from "react-intl";
import { I18nProvider } from "../i18n/I18nProvider";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "./VariableDoseProtocolTable.scss";

var vdpHeaders = [
    { key: "stageName", id: "VARIABLE_DOSE_TABLE_HEADER_STAGE", defaultMessage: "Stage" },
    { key: "startDate", id: "VARIABLE_DOSE_TABLE_HEADER_START_DATE", defaultMessage: "Start Date" },
    { key: "dose", id: "VARIABLE_DOSE_TABLE_HEADER_DOSE", defaultMessage: "Dose" },
    { key: "frequency", id: "VARIABLE_DOSE_TABLE_HEADER_FREQUENCY", defaultMessage: "Frequency" },
    { key: "duration", id: "VARIABLE_DOSE_TABLE_HEADER_DURATION", defaultMessage: "Duration" },
];

function formatStageDate(date, intl) {
    if (!date) return "";
    var d = new Date(date);
    if (isNaN(d.getTime())) return "";
    var day = intl.formatDate(d, { day: "2-digit" });
    var month = intl.formatDate(d, { month: "short" });
    var year = intl.formatDate(d, { year: "numeric" });
    return day + " " + month + " " + year;
}

var detailFields = [
    { key: "instructions", id: "VARIABLE_DOSE_TABLE_DETAIL_INSTRUCTIONS", defaultMessage: "Instructions" },
    { key: "rate", id: "VARIABLE_DOSE_TABLE_DETAIL_RATE", defaultMessage: "Rate (ml/hr)" },
    { key: "additives", id: "VARIABLE_DOSE_TABLE_DETAIL_ADDITIVES", defaultMessage: "Additives" },
    { key: "additionalInstructions", id: "VARIABLE_DOSE_TABLE_DETAIL_ADDITIONAL_INSTRUCTIONS", defaultMessage: "Additional Instructions" },
];

function ExpandedDetails(props) {
    var stage = props.stage;
    var fields = detailFields.filter(function (f) { return !!stage[f.key]; });

    if (fields.length === 0) return null;

    return (
        <div className="vdp-expanded-details">
            {fields.map(function (f, i) {
                return (
                    <div key={f.key} className={"vdp-detail-item" + (i < fields.length - 1 ? " vdp-detail-item--separator" : "")}>
                        <div className="vdp-detail-label">
                            <FormattedMessage id={f.id} defaultMessage={f.defaultMessage} />
                        </div>
                        <div className="vdp-detail-value">{stage[f.key]}</div>
                    </div>
                );
            })}
        </div>
    );
}

ExpandedDetails.propTypes = {
    stage: PropTypes.object.isRequired,
};

function VariableDoseProtocolTableInner(props) {
    const intl = useIntl();
    var hostData = props.hostData;
    var [expandedRows, setExpandedRows] = useState({});

    if (!hostData || !hostData.stages || hostData.stages.length === 0) {
        return null;
    }

    var loadingDoseCount = hostData.stages.filter(function (s) { return s.isLoadingDose; }).length;
    var LOADING_DOSE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_LOADING_DOSE_LABEL", defaultMessage: "Loading Dose" });

    var getStageDisplay = function (stage) {
        if (stage.isLoadingDose) { return LOADING_DOSE_LABEL; }
        if (stage.sequence != null) { return String(stage.sequence - loadingDoseCount); }
        return stage.stageName || '';
    };

    var allExpanded = hostData.stages.every(function (_, i) { return !!expandedRows[i]; });

    const COLLAPSE_ALL = intl.formatMessage({ id: "VARIABLE_DOSE_TABLE_COLLAPSE_ALL", defaultMessage: "Collapse all rows" });
    const EXPAND_ALL = intl.formatMessage({ id: "VARIABLE_DOSE_TABLE_EXPAND_ALL", defaultMessage: "Expand all rows" });
    const COLLAPSE_ROW = intl.formatMessage({ id: "VARIABLE_DOSE_TABLE_COLLAPSE_ROW", defaultMessage: "Collapse row" });
    const EXPAND_ROW = intl.formatMessage({ id: "VARIABLE_DOSE_TABLE_EXPAND_ROW", defaultMessage: "Expand row" });

    var toggleRow = function (index) {
        setExpandedRows(function (prev) {
            var next = Object.assign({}, prev);
            next[index] = !prev[index];
            return next;
        });
    };

    var toggleAll = function () {
        var expanded = {};
        hostData.stages.forEach(function (_, i) { expanded[i] = !allExpanded; });
        setExpandedRows(expanded);
    };

    return (
        <div className="next-ui vdp-section">
            <p className="vdp-title">
                <FormattedMessage id="VARIABLE_DOSE_TABLE_TITLE" defaultMessage="Variable Dosage Protocol" />
            </p>
            <Table className="vdp-table">
                <TableHead>
                    <TableRow>
                        <TableHeader className="vdp-expand-col">
                            <button
                                type="button"
                                className="vdp-expand-btn"
                                onClick={toggleAll}
                                aria-label={allExpanded ? COLLAPSE_ALL : EXPAND_ALL}
                            >
                                {allExpanded ? <ChevronUp16 /> : <ChevronDown16 />}
                            </button>
                        </TableHeader>
                        {vdpHeaders.map(function (h) {
                            return (
                                <TableHeader key={h.key}>
                                    <FormattedMessage id={h.id} defaultMessage={h.defaultMessage} />
                                </TableHeader>
                            );
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hostData.stages.map(function (stage, index) {
                        var isExpanded = !!expandedRows[index];
                        var hasDetails = detailFields.some(function (f) { return !!stage[f.key]; });
                        return (
                            <React.Fragment key={index}>
                                <TableRow className="vdp-data-row">
                                    <TableCell className="vdp-expand-cell">
                                        {hasDetails && (
                                            <button
                                                type="button"
                                                className="vdp-expand-btn"
                                                onClick={function () { toggleRow(index); }}
                                                aria-label={isExpanded ? COLLAPSE_ROW : EXPAND_ROW}
                                            >
                                                {isExpanded ? <ChevronUp16 /> : <ChevronDown16 />}
                                            </button>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStageDisplay(stage)}</TableCell>
                                    <TableCell>{formatStageDate(stage.startDate, intl)}</TableCell>
                                    <TableCell>{stage.dose} {stage.unit}</TableCell>
                                    <TableCell>{stage.frequency}</TableCell>
                                    <TableCell>{stage.duration}{stage.durationUnit ? ` ${stage.durationUnit}` : ''}</TableCell>
                                </TableRow>
                                {isExpanded && hasDetails && (
                                    <TableRow className="vdp-expanded-content-row">
                                        <TableCell />
                                        <TableCell colSpan={5} className="vdp-expanded-cell">
                                            <ExpandedDetails stage={stage} />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

export function VariableDoseProtocolTable(props) {
    return (
        <I18nProvider>
            <VariableDoseProtocolTableInner {...props} />
        </I18nProvider>
    );
}

VariableDoseProtocolTable.propTypes = {
    hostData: PropTypes.shape({
        stages: PropTypes.arrayOf(
            PropTypes.shape({
                stageName: PropTypes.string,
                dose: PropTypes.string,
                unit: PropTypes.string,
                frequency: PropTypes.string,
                duration: PropTypes.string,
                startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
                instructions: PropTypes.string,
                rate: PropTypes.string,
                additives: PropTypes.string,
                additionalInstructions: PropTypes.string,
            })
        ),
    }),
};
