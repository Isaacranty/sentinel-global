import { COURSES } from "@/lib/courses";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <main className="min-h-screen">
      <header className="px-6 py-8 border-b border-panelLine">
        <div className="max-w-4xl mx-auto flex items-baseline justify-between">
          <div>
            <Link href="/" className="font-mono text-xs text-text-muted hover:text-signal">
              ← Sentinel Global
            </Link>
            <h1 className="font-mono text-xl tracking-tight mt-2">Internal Academy</h1>
            <p className="text-text-muted text-sm mt-1">Exclusive global security training.</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-2">
        {COURSES.map((course) => (
          <div key={course.id} className="border border-panelLine bg-panel p-6 rounded-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[10px] text-signal uppercase tracking-widest">{course.category}</span>
              <span className="font-mono text-[10px] text-text-muted">{course.lessons.length} LESSONS</span>
            </div>
            <h3 className="text-lg font-bold mb-2">{course.title}</h3>
            <p className="text-text-muted text-xs mb-6 h-10 overflow-hidden">{course.description}</p>
            <Link
              href={`/courses/${course.id}/${course.lessons[0].id}`}
              className="inline-block bg-signal text-ink font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm hover:bg-signal/80 transition-colors"
            >
              Start Training
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
