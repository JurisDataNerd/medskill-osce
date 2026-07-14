export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-slate-100 py-24"
    >

      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-8">

        <Feature
          title="Realtime Monitoring"
        />

        <Feature
          title="Structured Assessment"
        />

        <Feature
          title="Mentor Feedback"
        />

      </div>

    </section>
  );
}

function Feature({ title }) {
  return (
    <div className="rounded-2xl bg-white p-10 shadow">

      <h3 className="text-2xl font-bold">

        {title}

      </h3>

    </div>
  );
}