import React from "react";
import propTypes from "prop-types";
import { Modal } from "carbon-components-react";
import "./FileViewerModal.scss";

export const FileViewerModal = (props) => {
  const { closeModel, infoMap } = props;
  return (
    <Modal
      open
      passiveModal
      className="file-viewer-modal"
      onRequestClose={closeModel}
    >
      {infoMap.fileType === "video/mp4" ? (
        <video className="file-modal" aria-label="video-tag" controls>
          <source src={infoMap.fileSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={infoMap.fileSource} alt="image" className="file-modal" />
      )}
      {
        <div className="modal-footer">
          {infoMap?.comment && (
            <div className="modal-comment">{infoMap?.comment}</div>
          )}
          <span>{infoMap?.providerName}</span>&nbsp;
          <span>{infoMap?.encounterDateTime}</span>
        </div>
      }
    </Modal>
  );
};

FileViewerModal.propTypes = {
  closeModel: propTypes.func,
  infoMap: propTypes.object,
};

export default FileViewerModal;
