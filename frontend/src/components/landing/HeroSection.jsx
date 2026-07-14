import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="bg-[#1E3A8A] py-32 text-white">

      <div className="mx-auto max-w-7xl px-8">

        <h1 className="max-w-3xl text-6xl font-black leading-tight">

          Platform
          <br />
          Simulasi OSCE
          <br />
          by Medskill Indonesia

        </h1>

        <p className="mt-8 max-w-xl text-lg text-blue-100">

          Praxis membantu institusi kesehatan
          menyelenggarakan simulasi OSCE secara
          realtime, terstruktur, dan paperless.

        </p>

        <div className="mt-10 flex gap-5">

          <a
            href="#sessions"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-[#1E3A8A]"
          >
            Explore Sessions
          </a>

          <Link
            to="/login"
            className="rounded-xl border border-white px-8 py-4"
          >
            Login
          </Link>

        </div>

      </div>

    </section>
  );
}