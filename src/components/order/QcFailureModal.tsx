import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

type QcFailureModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, requestStoreWithOperator: boolean) => void;
  isSubmitting?: boolean;
};

/**
 * Collects QC failure reason (stored as an order-item note) and whether to
 * include operatorId so the backend opens a store request / new Sale in the same PATCH.
 */
export function QcFailureModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: QcFailureModalProps) {
  const [reason, setReason] = useState("");
  const [requestStoreWithOperator, setRequestStoreWithOperator] = useState(true);

  useEffect(() => {
    if (open) {
      setReason("");
      setRequestStoreWithOperator(true);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4">
      <div
        className="relative w-full max-w-lg rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-strokedark dark:bg-boxdark"
        role="dialog"
        aria-labelledby="qc-fail-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 text-body hover:text-black dark:text-bodydark dark:hover:text-white"
          aria-label="Close"
        >
          <IoMdClose className="text-2xl" />
        </button>
        <h2
          id="qc-fail-title"
          className="pr-8 text-lg font-semibold text-black dark:text-white"
        >
          QC failed — remake
        </h2>
        <p className="mt-2 text-sm text-body dark:text-bodydark">
          Describe the failure (broken lens, surfacing error, etc.). This is saved as an order
          item note. Sending failure triggers a backend remake: the line returns to production
          with approval kept; include yourself as operator below to request stock from the store
          in the same step.
        </p>
        <label className="mt-4 block text-sm font-medium text-black dark:text-white">
          Failure reason
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          disabled={isSubmitting}
          className="mt-1 w-full rounded border border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
          placeholder="Required — e.g. chipped edge, wrong axis surfaced"
        />
        <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-black dark:text-white">
          <input
            type="checkbox"
            checked={requestStoreWithOperator}
            onChange={(e) => setRequestStoreWithOperator(e.target.checked)}
            disabled={isSubmitting}
            className="mt-1"
          />
          <span>
            Request from store in this request{" "}
            <span className="text-body dark:text-bodydark">
              (sends your user ID as <code className="text-xs">operatorId</code> — creates a new
              store sale / request)
            </span>
          </span>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !reason.trim()}
            onClick={() => onConfirm(reason.trim(), requestStoreWithOperator)}
            className="rounded bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Record & fail QC"}
          </button>
        </div>
      </div>
    </div>
  );
}
