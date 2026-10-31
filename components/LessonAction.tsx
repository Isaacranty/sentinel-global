"use client";

import { useEffect } from "react";

export default function LessonAction({ courseId, lessonId }: { courseId: string, lessonId: string }) {
  useEffect(() => {
    // Automatically mark as complete when they open the page
    fetch("/api/courses/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, lessonId }),
    });
  }, [courseId, lessonId]);

  return null;
}
