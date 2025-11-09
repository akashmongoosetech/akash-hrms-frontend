import React from 'react';

interface AlertMessagesProps {
  showSuccess: boolean;
  successMessage: string;
  showError: boolean;
  errorMessage: string;
  setShowSuccess: (show: boolean) => void;
  setShowError: (show: boolean) => void;
}

export default function AlertMessages({
  showSuccess,
  successMessage,
  showError,
  errorMessage,
  setShowSuccess,
  setShowError,
}: AlertMessagesProps) {
  return (
    <>
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
      {showError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowError(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
    </>
  );
}