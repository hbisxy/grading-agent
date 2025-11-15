"use client";

import { useState } from "react";

const DistributionSettings = ({ calibrationData, onComplete }) => {
  const [average, setAverage] = useState("");
  const [standardDeviation, setStandardDeviation] = useState("");
  const [minimumScore, setMinimumScore] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const handleSubmit = () => {
    if (!average || !standardDeviation) {
      alert(
        "Please enter both average and standard deviation for the distribution."
      );
      return;
    }

    const settings = {
      distribution: {
        average: parseFloat(average),
        standardDeviation: parseFloat(standardDeviation),
      },
      minimumScore: minimumScore ? parseFloat(minimumScore) : null,
      additionalInstructions,
      calibrationData,
    };

    console.log("Distribution settings:", settings);

    if (onComplete) {
      onComplete(settings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Distribution Settings
          </h1>
          <p className="text-gray-600">
            Configure the grading distribution for the remaining assignments
          </p>
        </div>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              What distribution are you targeting?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={average}
                  onChange={(e) => setAverage(e.target.value)}
                  className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 7.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Deviation
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={standardDeviation}
                  onChange={(e) => setStandardDeviation(e.target.value)}
                  className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1.5"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              What is the minimum score for a submission?
            </h2>
            <input
              type="number"
              step="0.1"
              min="0"
              value={minimumScore}
              onChange={(e) => setMinimumScore(e.target.value)}
              className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 0 or 1"
            />
          </div>

          <div className="pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Any additional instructions
            </h2>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="4"
              placeholder="Enter any special instructions or considerations for grading..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Setup & Start AI Grading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionSettings;
