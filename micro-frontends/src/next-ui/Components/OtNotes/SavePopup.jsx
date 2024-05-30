import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Modal, TextArea, DatePicker, DatePickerInput} from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "./OtNotes.scss";
import {FormattedMessage, useIntl} from "react-intl";
import {I18nProvider} from '../i18n/I18nProvider';
import moment from "moment";
import {saveNote, updateNoteForADay} from "./utils";

export function SavePopup(props) {
    const {hostData, hostApi} = props;
    const {
        notes,
        weekEndDateTime = moment().endOf('day'),
        weekStartDateTime = moment().startOf('day'),
        isDayView,
        noteId,
        noteDate,
        providerUuid
    } = hostData;
    const [modalNotes, setModalNotes] = useState(notes || "");
    const [startDate, setStartDate] = useState(new Date(noteDate));
    const [endDate, setEndDate] = useState(new Date(noteDate));
    const [shouldShowErrors, setShouldShowErrors] = useState(false);
    const validMinStartDate = noteId || isDayView ? new Date(noteDate) : new Date(weekStartDateTime);
    const [validMinEndDate, setValidMinEndDate] = useState(noteId || isDayView ? new Date(noteDate) : new Date(weekEndDateTime));
    const [isLoading, setIsLoading] = useState(false);
    const intl = useIntl();

    const hasActiveErrors = () => {
        return !modalNotes || !startDate || !endDate || startDate > endDate;
    }

    const handleSave = () => {
        if (noteId) {
            updateNoteForADay(noteId, modalNotes, providerUuid).then(() => {
                setIsLoading(false);
                hostApi?.onSuccess();
            });
        } else if (isDayView) {
            saveNote(modalNotes, startDate).then(() => {
                setIsLoading(false);
                hostApi?.onSuccess();
            });
        } else {
            saveNote(modalNotes, startDate, endDate).then(() => {
                setIsLoading(false);
                hostApi?.onSuccess();
            });
        }
    }
    useEffect(() => {
        setValidMinEndDate(startDate);
    }, [startDate]);
    return (
        <I18nProvider>
            <Modal
                open
                className={"next-ui ot-notes-popup"}
                modalHeading={noteId ? <FormattedMessage id={'UPDATE_NOTE_TITLE'} defaultMessage={"Update Notes"}/> :
                    <FormattedMessage id={'ADD_NOTE_TITLE'} defaultMessage={"Add Notes"}/>}
                primaryButtonText={isLoading ?
                    <FormattedMessage id={"LOADING"} defaultMessage={"Loading..."}/> : noteId ?
                        <FormattedMessage id={"UPDATE"} defaultMessage={"Update"}/> :
                        <FormattedMessage id={"SAVE"} defaultMessage={"Save"}/>}
                secondaryButtonText={<FormattedMessage id={"CANCEL"} defaultMessage={"Cancel"}/>}
                onRequestClose={hostApi?.onClose}
                onRequestSubmit={() => {
                    setShouldShowErrors(true);
                    if (!hasActiveErrors()) {
                        setIsLoading(true);
                        handleSave();
                    }
                }}
            >
                <TextArea labelText={<FormattedMessage id={"OT_NOTES"} defaultMessage={"Notes"}/>}
                          value={modalNotes}
                          placeholder={intl.formatMessage({
                              id: "NOTES_PLACEHOLDER",
                              defaultMessage: "Enter a maximum of 150 characters"
                          })} maxCount={150} onChange={e => {
                    setModalNotes(e?.target?.value);
                }}/>
                {shouldShowErrors && !modalNotes ?
                    <p className={"error-text"}><FormattedMessage id={"EMPTY_NOTES_ERROR"}
                                                                  defaultMessage={"Note cannot be empty"}/>
                    </p> : <div style={{height: "20px"}}></div>}
                <div className={"date-range"}>
                    <div>
                        <DatePicker datePickerType="single" maxDate={new Date(weekEndDateTime)} dateFormat={"d/m/Y"}
                                    minDate={validMinStartDate} value={startDate}
                                    onChange={(e) => {
                                        if (e.length === 1) {
                                            setStartDate(e[0]);
                                        }
                                    }}>
                            <DatePickerInput
                                id="date-picker-input-id-start"
                                placeholder="dd/mm/yyyy"
                                labelText="Start date"
                                disabled={Boolean(isDayView || noteId)}
                            />
                        </DatePicker>
                        {shouldShowErrors && !startDate ?
                            <div className={"error-text"}><FormattedMessage id={'DATE_OUT_OF_RANGE_ERROR'}
                                                                            defaultMessage={"Please select date within the valid range"}/>
                            </div> : startDate > endDate ?
                                <div className={"error-text"}><FormattedMessage id={'FROM_DATE_BEFORE_TO_DATE_ERROR'}
                                                                                defaultMessage={"From date should be before To date"}/>
                                </div> :
                                <div style={{height: "20px"}}></div>
                        }
                    </div>
                    <div>
                        <DatePicker datePickerType="single" maxDate={new Date(weekEndDateTime)} dateFormat={"d/m/Y"}
                                    minDate={validMinEndDate} value={endDate}
                                    onChange={(e) => {
                                        if (e.length === 1) {
                                            setEndDate(e[0]);
                                        }
                                    }}>
                            <DatePickerInput
                                id="date-picker-input-id-finish"
                                placeholder="dd/mm/yyyy"
                                labelText="End date"
                                disabled={Boolean(isDayView || noteId)}
                            />
                        </DatePicker>
                        {shouldShowErrors && !endDate ?
                            <div className={"error-text"}><FormattedMessage id={'DATE_OUT_OF_RANGE_ERROR'}
                                                                            defaultMessage={"Please select date within the valid range"}/>
                            </div> : <div style={{height: "20px"}}></div>}
                    </div>
                </div>
            </Modal>
        </I18nProvider>
    );
}

SavePopup.propTypes = {
    hostData: PropTypes.any,
    hostApi: PropTypes.any,
}