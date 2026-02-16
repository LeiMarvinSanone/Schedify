import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ message = "Are you sure?", onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-btn yes-btn" onClick={onConfirm}>
            Yes
          </button>
          <button className="confirm-btn no-btn" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;