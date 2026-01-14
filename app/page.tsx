import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8FAFC] px-4 py-10 text-center">
      <h1 className="text-4xl font-semibold text-[#0F172A]">Premium Visitor Experience</h1>
      <p className="max-w-2xl text-sm text-[#475569]">
        Fast, professional visitor registrations with clear navigation between the guest flow and the admin command console.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/visitor/checkin"
          className="rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Start Check-in
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-[#CBD5E1] px-6 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
