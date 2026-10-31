"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/courses";

type Props = {
  courseId: string;
  lessonId: string;
  questions: QuizQuestion[];
  isCompleted: boolean;
};

export default function LessonQuiz({ courseId, lessonId, questions, isCompleted }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitting] = useState(false);
  const [passed, setPassed] = useState(isCompleted);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/courses/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, answers }),
      });

      const data = await res.json();
      if (res.ok) {
        setPassed(true);
      } else {
        setError(data.error || "Tactical error: Validation failed. Check your answers.");
      }
    } catch (e) {
      setError("Communication failure with Central Command.");
    } finally {
      setSubmitting(false);
    }
  }

  if (passed) {
    return (
      <div className="bg-signal/10 border border-signal p-6 rounded-sm mt-10">
        <h4 className="font-mono text-sm text-signal font-bold mb-2 uppercase">✓ KNOWLEDGE VALIDATED</h4>
        <p className="text-xs text-text-muted font-mono leading-relaxed">
          Central Command has verified your mastery of this lesson. XP points have been issued to your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-panel border border-panelLine p-8 rounded-sm mt-12">
      <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-8">Lesson Validation Quiz</h3>

      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div key={q.id}>
            <p className="text-sm font-semibold mb-4">{qIndex + 1}. {q.question}</p>
            <div className="grid gap-2">
              {q.options.map((option, oIndex) => (
                <button
                  key={oIndex}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oIndex }))}
                  className={`w-full text-left px-4 py-3 text-xs font-mono rounded-sm border transition-all ${
                    answers[q.id] === oIndex
                      ? "bg-signal/10 border-signal text-signal"
                      : "bg-ink/40 border-panelLine text-text-muted hover:border-text-muted/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-critical text-[10px] font-mono mt-6 uppercase tracking-wider">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitted}
        className="mt-10 bg-signal text-ink px-8 py-3 text-xs font-mono font-bold uppercase tracking-widest rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
      >
        {submitted ? "Verifying..." : "Validate Knowledge"}
      </button>
    </div>
  );
}
