import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } } }
  });

  if (!cert) return notFound();

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-panel border-4 border-double border-signal p-12 relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <h1 className="text-[200px] font-mono -rotate-12">SENTINEL</h1>
        </div>

        <div className="relative z-10 text-center">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-8">Sentinel Global Intelligence</h2>

            <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Service Record & Certification</h1>
            <p className="font-mono text-text-muted text-sm mb-12">This document verifies the operational competency of:</p>

            <div className="border-b-2 border-signal/40 inline-block px-12 pb-2 mb-12">
                <span className="text-3xl font-mono text-text">{cert.user.name}</span>
            </div>

            <p className="text-lg mb-2">Has successfully completed the course of study:</p>
            <h3 className="text-2xl font-bold text-signal mb-12 uppercase">{cert.courseTitle}</h3>

            <div className="grid grid-cols-2 gap-10 mt-16 pt-10 border-t border-panelLine">
                <div className="text-left">
                    <span className="block font-mono text-[10px] text-text-muted uppercase">Issue Date</span>
                    <span className="font-mono text-xs">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                    <span className="block font-mono text-[10px] text-text-muted uppercase">Verification Hash</span>
                    <span className="font-mono text-[10px] break-all">{cert.certHash}</span>
                </div>
            </div>

            <div className="mt-12">
                <Link
                    href="/profile"
                    className="no-print bg-panel border border-panelLine px-4 py-2 text-[10px] font-mono text-text-muted hover:text-signal transition-colors"
                >
                    ← Back to Profile
                </Link>
                <button
                    onClick={() => window.print()}
                    className="no-print ml-4 bg-signal text-ink px-4 py-2 text-[10px] font-mono font-bold rounded-sm uppercase tracking-widest"
                >
                    Download PDF / Print
                </button>
            </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-panel { border-color: black !important; }
          .text-signal { color: black !important; }
        }
      `}} />
    </main>
  );
}
