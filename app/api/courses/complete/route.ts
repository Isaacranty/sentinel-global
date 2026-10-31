import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityStore";
import { createNotification } from "@/lib/notifications";
import { getCourse } from "@/lib/courses";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, lessonId, answers } = await req.json();

  const course = getCourse(courseId);
  const lesson = course?.lessons.find(l => l.id === lessonId);

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // Validate Quiz if exists
  if (lesson.quiz) {
      if (!answers) return NextResponse.json({ error: "Answers required for validation." }, { status: 400 });
      for (const q of lesson.quiz) {
          if (answers[q.id] !== q.correctAnswer) {
              return NextResponse.json({ error: "Validation failed: One or more answers are incorrect." }, { status: 400 });
          }
      }
  }

  try {
    await prisma.courseProgress.upsert({
      where: { userId_courseId_lessonId: { userId: session.user.id, courseId, lessonId } },
      create: { userId: session.user.id, courseId, lessonId },
      update: {},
    });

    // Award XP (50 XP per lesson)
    await logActivity(session.user.id, "XP_EARNED", {
        amount: 50,
        reason: `Validated lesson: ${lesson.title}`
    });

    await createNotification(
        session.user.id,
        "XP_EARNED",
        "XP Points Issued",
        `+50 XP for validating knowledge: ${lesson.title}`
    );

    // Check if the whole course is finished
    if (course) {
        const completedLessons = await prisma.courseProgress.count({
            where: { userId: session.user.id, courseId }
        });

        if (completedLessons === course.lessons.length) {
            const crypto = require("crypto");
            const certHash = crypto.createHash("sha256").update(`${session.user.id}-${courseId}-${Date.now()}`).digest("hex").slice(0, 16).toUpperCase();

            await logActivity(session.user.id, "COURSE_COMPLETED", {
                courseId,
                courseTitle: course.title
            });

            await prisma.certificate.create({
                data: {
                    userId: session.user.id,
                    courseId,
                    courseTitle: course.title,
                    certHash
                }
            });

            await createNotification(
                session.user.id,
                "SYSTEM",
                "Certification Issued",
                `Congratulations! Your Service Record for ${course.title} is now available.`,
                "/profile"
            );
        }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
