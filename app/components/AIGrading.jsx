"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const AIGrading = ({ calibrationData, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gradedAssignments, setGradedAssignments] = useState([]);
  const [isGrading, setIsGrading] = useState(false);
  const [currentThought, setCurrentThought] = useState("");
  const [stats, setStats] = useState({
    average: 0,
    standardDeviation: 0,
    needsRegrade: false,
  });

  const remainingAssignments = calibrationData.remainingAssignments || [];

  const gradeNextAssignment = async () => {
    if (currentIndex >= remainingAssignments.length) {
      onComplete(gradedAssignments);
      return;
    }

    setIsGrading(true);
    const assignment = remainingAssignments[currentIndex];

    try {
      // Call AI grading API
      setCurrentThought("Analyzing student response...");
      const response = await fetch("/api/grade-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment,
          criteria: calibrationData.criteria,
          calibrationExamples: calibrationData.gradedAssignments,
          previousGrades: gradedAssignments,
        }),
      });

      const result = await response.json();

      // Add to graded assignments
      const newGradedAssignments = [
        ...gradedAssignments,
        {
          ...assignment,
          score: result.score,
          reasoning: result.reasoning,
          highlights: result.highlights,
        },
      ];
      setGradedAssignments(newGradedAssignments);

      // Calculate statistics
      setCurrentThought("Calculating deviation from calibration examples...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newStats = calculateStatistics(
        newGradedAssignments,
        calibrationData.gradedAssignments
      );
      setStats(newStats);

      // Check if regrade is needed
      if (newStats.needsRegrade && newGradedAssignments.length >= 5) {
        setCurrentThought("Deviation too high! Regrading previous assignments...");
        await regradeAssignments(newGradedAssignments);
      } else {
        setCurrentThought("Grade assigned successfully");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCurrentIndex(currentIndex + 1);
        setIsGrading(false);
      }
    } catch (error) {
      console.error("Error grading assignment:", error);
      setCurrentThought("Error occurred. Retrying...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsGrading(false);
    }
  };

  const calculateStatistics = (graded, calibration) => {
    const allScores = [
      ...calibration.map((a) => a.score),
      ...graded.map((a) => a.score),
    ];

    const average = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
    
    const variance =
      allScores.reduce((sum, s) => sum + Math.pow(s - average, 2), 0) /
      allScores.length;
    const standardDeviation = Math.sqrt(variance);

    // Check if current assignment deviates too much (> 1.5 standard deviations)
    const currentScore = graded[graded.length - 1]?.score || 0;
    const deviation = Math.abs(currentScore - average);
    const needsRegrade = deviation > 1.5 * standardDeviation && graded.length >= 5;

    return { average, standardDeviation, needsRegrade };
  };

  const regradeAssignments = async (assignments) => {
    // Regrade the last 3 assignments with updated context
    const toRegrade = assignments.slice(-3);
    const regradedResults = [];

    for (const assignment of toRegrade) {
      setCurrentThought(`Regrading: ${assignment.studentName}...`);
      
      const response = await fetch("/api/grade-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment,
          criteria: calibrationData.criteria,
          calibrationExamples: calibrationData.gradedAssignments,
          previousGrades: assignments,
          isRegrade: true,
        }),
      });

      const result = await response.json();
      regradedResults.push({
        ...assignment,
        score: result.score,
        reasoning: result.reasoning,
        highlights: result.highlights,
        regraded: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Update the assignments with regraded versions
    const updated = [
      ...assignments.slice(0, -3),
      ...regradedResults,
    ];
    setGradedAssignments(updated);

    // Recalculate stats
    const newStats = calculateStatistics(updated, calibrationData.gradedAssignments);
    setStats(newStats);

    setCurrentThought("Regrading complete. Continuing...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentIndex(currentIndex + 1);
    setIsGrading(false);
  };

  // Start grading when component mounts
  useEffect(() => {
    if (remainingAssignments.length > 0 && gradedAssignments.length === 0) {
      gradeNextAssignment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continue grading as index changes
  useEffect(() => {
    if (!isGrading && currentIndex > 0 && currentIndex < remainingAssignments.length) {
      gradeNextAssignment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isGrading]);

  const progress = (gradedAssignments.length / remainingAssignments.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AI Grading in Progress
          </h1>
          <p className="text-gray-600">
            Grading {remainingAssignments.length} assignments using calibration examples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress
            </span>
            <span className="text-sm font-medium text-gray-700">
              {gradedAssignments.length} / {remainingAssignments.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="text-purple-600 animate-pulse" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              AI Thinking Process
            </h2>
          </div>
          
          {isGrading && (
            <div className="space-y-3">
              <p className="text-gray-700">{currentThought}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                Processing...
              </div>
            </div>
          )}

          {!isGrading && gradedAssignments.length === remainingAssignments.length && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={20} />
              <p className="font-medium">All assignments graded!</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.average.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">out of 10</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-orange-600" />
              <h3 className="text-sm font-medium text-gray-600">Std. Deviation</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.standardDeviation.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">consistency measure</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={20} className="text-green-600" />
              <h3 className="text-sm font-medium text-gray-600">Status</h3>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {stats.needsRegrade ? "Recalibrating" : "On Track"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.needsRegrade ? "Adjusting grades" : "Within tolerance"}
            </p>
          </div>
        </div>

        {/* Recently Graded */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recently Graded Assignments
          </h3>
          <div className="space-y-3">
            {gradedAssignments.slice(-5).reverse().map((assignment, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    assignment.regraded ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium text-gray-800">
                    {assignment.studentName}
                  </span>
                  {assignment.regraded && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Regraded
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-gray-800">
                  {assignment.score ? assignment.score.toFixed(1) : '0.0'}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGrading;