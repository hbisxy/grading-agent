"use client";

import { AlertCircle, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import DistributionSettings from './DistributionSettings';
import { useTextAnalysis } from '../hooks/useTextAnalysis';

const GradingCalibration = () => {
  const { analyzeText, isAnalyzing, error: analysisError } = useTextAnalysis();
  const [assignments] = useState([
    {
      id: 1,
      studentName: "John Smith",
      submittedDate: "Nov 15, 2025",
      question:
        "Explain the water cycle and its importance to Earth's ecosystems.",
      content: `The water cycle is a continuous process that circulates water throughout Earth's systems. Water evaporates from oceans, lakes, and rivers due to heat from the sun, turning from liquid into water vapor. This process is essential for distributing water across the planet.

As the water vapor rises into the atmosphere, it cools and condenses into clouds through a process called condensation. The clouds can travel great distances, carrying moisture to different regions.

Eventually, the water returns to Earth's surface. Precipitation occurs when water falls from clouds as rain, snow, sleet, or hail. This water then collects in bodies of water or soaks into the ground.

The water cycle is crucial for ecosystems because it provides fresh water for plants and animals, regulates temperature, and transports nutrients throughout the environment. Without this cycle, life on Earth would not be sustainable.

In conclusion, the water cycle demonstrates the interconnected nature of Earth's systems and highlights the importance of water conservation for maintaining healthy ecosystems.`,
    },
    {
      id: 2,
      studentName: "Sarah Johnson",
      submittedDate: "Nov 15, 2025",
      question:
        "Explain the water cycle and its importance to Earth's ecosystems.",
      content: `Water moves around our planet in what scientists call the water cycle. The sun heats up water in oceans and lakes, making it evaporate into the air as invisible water vapor.

When this water vapor gets high enough in the sky, it gets cold and turns back into tiny water droplets. These droplets stick together to form clouds. This is called condensation.

When the clouds get too heavy with water, the water falls back down as rain or snow. This is precipitation. The water either flows into rivers and streams or soaks into the ground.

This cycle is really important for all living things. Plants need water to grow, and animals need it to drink. The water cycle also helps move nutrients around and keeps the Earth's temperature balanced.

Without the water cycle, there wouldn't be any fresh water available, and life as we know it couldn't exist.`,
    },
    {
      id: 3,
      studentName: "Michael Chen",
      submittedDate: "Nov 15, 2025",
      question:
        "Explain the water cycle and its importance to Earth's ecosystems.",
      content: `The water cycle represents one of Earth's most fundamental processes...`,
    },
  ]);

  const [criteria] = useState([
    {
      id: "evaporation",
      text: "Describes evaporation process and the role of solar energy",
      color: "blue",
    },
    {
      id: "condensation",
      text: "Explains condensation and cloud formation",
      color: "green",
    },
    {
      id: "precipitation",
      text: "Identifies precipitation and its forms",
      color: "purple",
    },
    {
      id: "importance",
      text: "Discusses importance to ecosystems and life on Earth",
      color: "orange",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDistributionSettings, setShowDistributionSettings] = useState(false);
  const [highlights, setHighlights] = useState({
    1: [],
    2: [],
    3: [],
  });

  const [grades, setGrades] = useState(
    assignments.reduce((acc, assignment) => {
      acc[assignment.id] = criteria.reduce((criteriaAcc, criterion) => {
        criteriaAcc[criterion.id] = null;
        return criteriaAcc;
      }, {});
      return acc;
    }, {})
  );

  const [selectedCriterion, setSelectedCriterion] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const contentRef = useRef(null);

  const gradeOptions = ["Weak", "Average", "Good"];
  const colorClasses = {
    blue: "bg-blue-200 border-l-4 border-blue-500",
    green: "bg-green-200 border-l-4 border-green-500",
    purple: "bg-purple-200 border-l-4 border-purple-500",
    orange: "bg-orange-200 border-l-4 border-orange-500",
  };

  const handleGradeChange = (criterionId, value) => {
    setGrades((prev) => ({
      ...prev,
      [assignments[currentIndex].id]: {
        ...prev[assignments[currentIndex].id],
        [criterionId]: value,
      },
    }));
  };

  const handleTextSelection = () => {
    if (!selectedCriterion || !isSelecting) return;

    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (!selectedText || selectedText.trim().length === 0) return;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(contentRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);

    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    setHighlights((prev) => ({
      ...prev,
      [assignments[currentIndex].id]: [
        ...(prev[assignments[currentIndex].id] || []),
        { criterionId: selectedCriterion, start, end },
      ],
    }));

    selection.removeAllRanges();
  };

  const getCriterionCoverage = (assignmentId) => {
    const assignmentHighlights = highlights[assignmentId] || [];
    return criteria.map((criterion) => ({
      ...criterion,
      covered: assignmentHighlights.some((h) => h.criterionId === criterion.id),
    }));
  };

  const renderHighlightedContent = () => {
    const currentAssignment = assignments[currentIndex];
    const content = currentAssignment.content;
    const assignmentHighlights = highlights[currentAssignment.id] || [];

    if (assignmentHighlights.length === 0) {
      return (
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      );
    }

    const sortedHighlights = [...assignmentHighlights].sort(
      (a, b) => a.start - b.start
    );
    const parts = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`} className="text-gray-900">
            {content.substring(lastIndex, highlight.start)}
          </span>
        );
      }

      const criterion = criteria.find((c) => c.id === highlight.criterionId);
      parts.push(
        <span
          key={`highlight-${idx}`}
          className={`${
            colorClasses[criterion.color]
          } px-1 py-0.5 text-gray-900`}
        >
          {content.substring(highlight.start, highlight.end)}
        </span>
      );

      lastIndex = highlight.end;
    });

    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end" className="text-gray-900">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return <p className="whitespace-pre-wrap leading-relaxed">{parts}</p>;
  };

  const [totalScores, setTotalScores] = useState(
    assignments.reduce((acc, assignment) => {
      acc[assignment.id] = "";
      return acc;
    }, {})
  );

  // Add this handler
  const handleTotalScoreChange = (value) => {
    const numValue =
      value === "" ? "" : Math.min(10, Math.max(0, parseFloat(value) || 0));
    setTotalScores((prev) => ({
      ...prev,
      [assignments[currentIndex].id]: numValue,
    }));
  };

  const isAssignmentComplete = () => {
    const currentGrades = grades[assignments[currentIndex].id];
    return criteria.every((criterion) => currentGrades[criterion.id] !== null);
  };

  const getCompletedCount = () => {
    return assignments.filter((assignment) => {
      const assignmentGrades = grades[assignment.id];
      return criteria.every(
        (criterion) => assignmentGrades[criterion.id] !== null
      );
    }).length;
  };

  const handleNext = () => {
    if (currentIndex < assignments.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedCriterion(null);
      setIsSelecting(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedCriterion(null);
      setIsSelecting(false);
    }
  };

  const handleAIAnalysis = async () => {
    const currentAssignment = assignments[currentIndex];
    
    const result = await analyzeText(
      currentAssignment.content,
      criteria,
      currentAssignment.question
    );

    if (result) {
      // Update highlights with AI suggestions
      setHighlights((prev) => ({
        ...prev,
        [currentAssignment.id]: result.highlights,
      }));

      // Update grades with AI suggestions
      if (result.suggestedGrades) {
        setGrades((prev) => ({
          ...prev,
          [currentAssignment.id]: {
            ...prev[currentAssignment.id],
            ...result.suggestedGrades,
          },
        }));
      }
    }
  };

  const handleFinish = () => {
    console.log("Calibration complete!", { grades, highlights });
    setShowDistributionSettings(true);
  };

  const handleDistributionComplete = (settings) => {
    console.log("Distribution settings complete!", settings);
    alert("AI grading setup complete! Ready to grade remaining assignments.");
    // Here you would typically trigger the AI grading process
  };

  const currentAssignment = assignments[currentIndex];
  const currentGrades = grades[currentAssignment.id];
  const completedCount = getCompletedCount();
  const coverageStatus = getCriterionCoverage(currentAssignment.id);

  // Show distribution settings after finishing calibration
  if (showDistributionSettings) {
    const calibrationData = {
      grades,
      highlights,
      assignments: assignments.map(a => ({
        id: a.id,
        studentName: a.studentName,
        totalScore: totalScores[a.id]
      }))
    };
    
    return <DistributionSettings calibrationData={calibrationData} onComplete={handleDistributionComplete} />;
  }

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
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 p-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800">
                Student Submission
              </h2>
              <div className="flex items-center gap-3">
                {isSelecting && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <AlertCircle size={16} />
                    Highlight text mode active
                  </div>
                )}
                <button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Sparkles size={16} />
                  {isAnalyzing ? "Analyzing..." : "AI Auto-Highlight"}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {currentAssignment.studentName} • Submitted{" "}
              {currentAssignment.submittedDate}
            </p>
            {analysisError && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={14} />
                {analysisError}
              </div>
            )}
          </div>

          <div
            ref={contentRef}
            className="flex-1 p-6 overflow-y-auto"
            onMouseUp={handleTextSelection}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Essay Question: {currentAssignment.question}
            </h3>
            <div className="prose max-w-none">{renderHighlightedContent()}</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentIndex === assignments.length - 1 &&
          completedCount === assignments.length ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check size={20} />
              Finish Manual Grading
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === assignments.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Grading Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Expected Answer Points
          </h3>
          <p className="text-sm text-gray-600">
            {coverageStatus.filter((c) => c.covered).length} of{" "}
            {criteria.length} points covered
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {criteria.map((criterion, index) => {
            const isCovered = coverageStatus[index].covered;
            const isSelected = selectedCriterion === criterion.id;

            return (
              <div
                key={criterion.id}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-1 h-16 rounded ${
                      criterion.color === "blue"
                        ? "bg-blue-500"
                        : criterion.color === "green"
                        ? "bg-green-500"
                        : criterion.color === "purple"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 leading-snug">
                      {criterion.text}
                    </p>
                  </div>
                  {isCovered && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedCriterion(isSelected ? null : criterion.id);
                    setIsSelecting(!isSelected);
                  }}
                  className={`w-full mb-3 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {isSelected ? "Highlighting..." : "Highlight Text"}
                </button>

                <div className="flex gap-2">
                  {gradeOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleGradeChange(criterion.id, option)}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                        currentGrades[criterion.id] === option
                          ? option === "Good"
                            ? "bg-green-600 text-white"
                            : option === "Average"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isAssignmentComplete() && (
          <div className="p-4 bg-green-50 border-t border-green-200">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <Check size={16} />
              Assignment graded completely
            </p>
          </div>
        )}

        <>
          <div className="p-6 border-t border-gray-200 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Completion
                </span>
                <span className="text-lg font-bold text-green-600">
                  {Math.round(
                    (Object.values(currentGrades).filter((g) => g !== null)
                      .length /
                      criteria.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (Object.values(currentGrades).filter((g) => g !== null)
                        .length /
                        criteria.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Total Score
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={totalScores[currentAssignment.id]}
                  onChange={(e) => handleTotalScoreChange(e.target.value)}
                  className="text-gray-900 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-semibold"
                  placeholder="0"
                />
                <span className="text-gray-900 font-medium">/ 10</span>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default GradingCalibration;
