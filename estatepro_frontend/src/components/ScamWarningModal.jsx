// src/components/ScamWarningModal.jsx
import { useState } from 'react';

const ScamWarningModal = ({ onConfirm, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
          ⚠️ IMPORTANT ANTI-SCAM WARNING
        </h2>

        <p className="text-lg mb-6 text-center leading-relaxed">
          Do NOT send money to any agent's personal account.  
          All payments MUST go ONLY to the official company account to avoid being scammed.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2">Official Payment Details:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Bank:</strong> [Your Bank Name, e.g., GTBank]</li>
            <li><strong>Account Name:</strong> HomeMu Limited / [Your Company Name]</li>
            <li><strong>Account Number:</strong> [XXXXXXXXXX]</li>
            <li><strong>Note/Ref:</strong> Use property slug or booking ID</li>
          </ul>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="agree" className="ml-2 text-gray-700">
            I confirm I will pay ONLY to the official company account above
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-400"
          >
            Cancel / Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!agreed}
            className={`flex-1 py-3 rounded-lg font-bold text-white ${
              agreed ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            I Understand – Proceed
          </button>
        </div>

        <p className="text-xs text-center mt-6 text-gray-500">
          We never request direct transfers to individuals. Report suspicious requests.
        </p>
      </div>
    </div>
  );
};

export default ScamWarningModal;