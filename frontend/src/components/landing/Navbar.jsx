import PillNav from "./PillNav";

export default function Navbar() {
  const items = [
    { label: "Kenapa Praxis", href: "#why-praxis" },
    { label: "Tentang Praxis", href: "#about" },
    { label: "Anamnesis AI", href: "#proof" },
    { label: "Jadwal Simulasi", href: "#sessions" },
    { label: "Testimoni", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <PillNav
      logo="/praxis_0.png"
      logoAlt="Praxis by Medskill Logo"
      items={items}
      activeHref="#why-praxis"
      className="custom-nav"
      ease="power2.easeOut"
      baseColor="#0D3A68"
      pillColor="#C9A227"
      hoveredPillTextColor="#0D3A68"
      pillTextColor="#FFFFFF"
    />
  );
}