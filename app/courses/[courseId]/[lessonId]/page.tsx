import { getCourse, getLesson } from "@/lib/courses";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LessonQuiz from "@/components/LessonQuiz";
import TerminalLab from "@/components/TerminalLab";

export default async function LessonPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const session = await getServerSession(authOptions);
  const course = getCourse(params.courseId);
  const lesson = getLesson(params.courseId, params.lessonId);

  if (!course || !lesson) return notFound();

  const lessonIndex = course.lessons.findIndex(l => l.id === params.lessonId);
  const nextLesson = course.lessons[lessonIndex + 1];
  const prevLesson = course.lessons[lessonIndex - 1];

  const progress = session?.user?.id
    ? await prisma.courseProgress.findUnique({
        where: { userId_courseId_lessonId: { userId: session.user.id, courseId: params.courseId, lessonId: params.lessonId } }
      })
    : null;

  const isCompleted = !!progress;

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-panelLine bg-panel/50 flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-panelLine">
            <Link href="/courses" className="font-mono text-[10px] text-text-muted hover:text-signal">← Back to Academy</Link>
            <h2 className="text-sm font-bold mt-2 truncate">{course.title}</h2>
        </div>
        <nav className="p-4 space-y-1">
            {course.lessons.map((l, i) => (
                <Link
                    key={l.id}
                    href={`/courses/${course.id}/${l.id}`}
                    className={`block px-3 py-2 text-xs font-mono rounded-sm transition-colors ${
                        l.id === lesson.id ? "bg-signal/10 text-signal" : "text-text-muted hover:bg-panel hover:text-text"
                    }`}
                >
                    {i + 1}. {l.title}
                </Link>
            ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="px-10 py-6 border-b border-panelLine flex items-center justify-between">
            <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest">Lesson {lessonIndex + 1} / {course.lessons.length}</h3>
            {isCompleted && <span className="text-signal font-mono text-[10px] uppercase">✓ Completed</span>}
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-12 max-w-4xl">
            <article className="prose prose-invert prose-sm max-w-none">
                <h1 className="text-2xl font-bold mb-6">{lesson.title}</h1>
                <div className="whitespace-pre-wrap font-body text-text-muted leading-relaxed">
                    {lesson.content}
                </div>
            </article>

            {lesson.downloadUrl && (
                <div className="mt-8 p-4 border border-signal/20 bg-signal/5 rounded-sm flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-signal uppercase tracking-wider">Tactical Resource Available</h4>
                        <p className="text-[10px] text-text-muted font-mono">Download the reference configuration for local lab practice.</p>
                    </div>
                    <a
                        href={lesson.downloadUrl}
                        download
                        className="bg-signal text-ink px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm hover:bg-signal/80 transition-colors"
                    >
                        Download .CFG
                    </a>
                </div>
            )}

            {lesson.terminal && (
                <TerminalLab
                    initialPath={lesson.terminal.initialPath}
                    expectedCommands={lesson.terminal.commands}
                />
            )}

            {lesson.quiz && (
                <LessonQuiz
                    courseId={params.courseId}
                    lessonId={params.lessonId}
                    questions={lesson.quiz}
                    isCompleted={isCompleted}
                />
            )}

            <div className="mt-12 pt-8 border-t border-panelLine flex justify-between">
                {prevLesson ? (
                    <Link href={`/courses/${course.id}/${prevLesson.id}`} className="text-xs font-mono text-text-muted hover:text-signal transition-colors">
                        ← Previous: {prevLesson.title}
                    </Link>
                ) : <div />}

                {nextLesson ? (
                    <Link
                        href={`/courses/${course.id}/${nextLesson.id}`}
                        className={`bg-panel border border-panelLine px-4 py-2 text-xs font-mono text-text hover:border-signal/60 transition-colors ${!isCompleted && lesson.quiz ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        Next: {nextLesson.title} →
                    </Link>
                ) : (
                    <Link
                        href="/courses"
                        className={`bg-signal text-ink px-6 py-2 text-xs font-mono uppercase tracking-widest font-bold ${!isCompleted && lesson.quiz ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        Finish Course
                    </Link>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}
