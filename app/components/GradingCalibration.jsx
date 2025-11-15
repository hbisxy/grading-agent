"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const GradingCalibration = () => {
  // Sample data - replace with real assignments
  const [assignments] = useState([
    {
      id: 1,
      studentName: "Student A",
      content:
        "Sample assignment content for student A. This would contain their full submission text...",
    },
    {
      id: 2,
      studentName: "Student B",
      content: "Sample assignment content for student B...",
    },
    {
      id: 3,
      studentName: "Student C",
      content: "Sample assignment content for student C...",
    },
    {
      id: 4,
      studentName: "Student D",
      content: "Sample assignment content for student D...",
    },
    {
      id: 5,
      studentName: "Student E",
      content: "Sample assignment content for student E...",
    },
    {
      id: 6,
      studentName: "Student F",
      content: "Sample assignment content for student F...",
    },
    {
      id: 7,
      studentName: "Student G",
      content: "Sample assignment content for student G...",
    },
    {
      id: 8,
      studentName: "Student H",
      content: "Sample assignment content for student H...",
    },
    {
      id: 9,
      studentName: "Student I",
      content: "Sample assignment content for student I...",
    },
    {
      id: 10,
      studentName: "Student J",
      content: "Sample assignment content for student J...",
    },
  ]);

  const [criteria] = useState([
    "Thesis Statement",
    "Evidence Quality",
    "Organization & Structure",
    "Citation Format",
    "Writing Clarity",
    "Critical Analysis",
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [grades, setGrades] = useState(
    assignments.reduce((acc, assignment) => {
      acc[assignment.id] = criteria.reduce((criteriaAcc, criterion) => {
        criteriaAcc[criterion] = null;
        return criteriaAcc;
      }, {});
      return acc;
    }, {})
  );

  const gradeOptions = ["Weak", "Average", "Good"];

  const handleGradeChange = (criterion, value) => {
    setGrades((prev) => ({
      ...prev,
      [assignments[currentIndex].id]: {
        ...prev[assignments[currentIndex].id],
        [criterion]: value,
      },
    }));
  };

  const isAssignmentComplete = () => {
    const currentGrades = grades[assignments[currentIndex].id];
    return criteria.every((criterion) => currentGrades[criterion] !== null);
  };

  const getCompletedCount = () => {
    return assignments.filter((assignment) => {
      const assignmentGrades = grades[assignment.id];
      return criteria.every(
        (criterion) => assignmentGrades[criterion] !== null
      );
    }).length;
  };

  const handleNext = () => {
    if (currentIndex < assignments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    console.log("Calibration complete!", grades);
    alert("Calibration complete! Ready to grade remaining assignments.");
  };

  const currentAssignment = assignments[currentIndex];
  const currentGrades = grades[currentAssignment.id];
  const completedCount = getCompletedCount();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Assignment Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Calibration Grading
            </h1>
            <div className="text-sm text-gray-600">
              {completedCount} of {assignments.length} completed
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(completedCount / assignments.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Assignment Display */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Assignment {currentIndex + 1}: {currentAssignment.studentName}
            </h2>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {currentAssignment.content}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentIndex === assignments.length - 1 &&
          completedCount === assignments.length ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Check size={20} />
              Finish Calibration
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === assignments.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Grading Panel */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Grading Checklist
        </h3>

        <div className="space-y-4">
          {criteria.map((criterion, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {criterion}
              </label>
              <div className="flex gap-2">
                {gradeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleGradeChange(criterion, option)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      currentGrades[criterion] === option
                        ? option === "Good"
                          ? "bg-green-600 text-white"
                          : option === "Average"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isAssignmentComplete() && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <Check size={16} />
              Assignment graded completely
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingCalibration;
