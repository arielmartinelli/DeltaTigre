type P = { name: string; className?: string };

/** Trazos ultra finos, dibujados a mano. Nada de librerias genericas. */
const paths: Record<string, React.ReactNode> = {
  wifi: <><path d="M2 8.5a15 15 0 0 1 20 0" /><path d="M5.5 12a10 10 0 0 1 13 0" /><path d="M9 15.5a5 5 0 0 1 6 0" /><circle cx="12" cy="19" r=".9" /></>,
  river: <><path d="M2 9c3-2 5 2 8 0s5-2 8 0" /><path d="M2 14c3-2 5 2 8 0s5-2 8 0" /><path d="M2 19c3-2 5 2 8 0s5-2 8 0" /></>,
  snow: <><path d="M12 2v20M4 6l16 12M20 6L4 18" /><path d="M9 4l3 2 3-2M9 20l3-2 3 2" /></>,
  heat: <><path d="M12 21c3.5 0 6-2.4 6-5.6 0-3.8-3.4-5-4.2-9.4C11.6 8 12.6 10 10.4 12 9 10.8 9.4 9 9.4 9 7.6 10.6 6 12.9 6 15.4 6 18.6 8.5 21 12 21Z" /></>,
  fire: <><path d="M12 21c3.5 0 6-2.4 6-5.6 0-3.8-3.4-5-4.2-9.4C11.6 8 12.6 10 10.4 12 9 10.8 9.4 9 9.4 9 7.6 10.6 6 12.9 6 15.4 6 18.6 8.5 21 12 21Z" /><path d="M12 21c1.6 0 2.7-1.1 2.7-2.6 0-1.7-1.7-2.5-2.2-4.4-1 1.2-1.6 2-2.6 3 0 2.1 1 4 2.1 4Z" /></>,
  bbq: <><path d="M4 6h16l-3.2 8H7.2L4 6Z" /><path d="M8.5 14 7 21M15.5 14 17 21M9 18h6" /><path d="M9 3c0 1-1 1.2-1 2M12 2.5c0 1.2-1 1.4-1 2.4M15 3c0 1-1 1.2-1 2" /></>,
  kitchen: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M3.5 9.5h17" /><circle cx="8" cy="14.5" r="1.8" /><circle cx="15" cy="14.5" r="1.8" /><path d="M7 6.7h3" /></>,
  utensils: <><path d="M7 2v9M5 2v4a2 2 0 0 0 4 0V2M7 11v11" /><path d="M17.5 2c-1.6 1.4-2.2 3.4-2.2 5.6 0 1.7.7 2.6 2.2 2.9V22" /></>,
  fridge: <><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M6 10h12" /><path d="M9 6v2M9 13v2.5" /></>,
  microwave: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><rect x="5" y="8.5" width="10" height="7" rx="1" /><path d="M18 9v.01M18 12v.01M18 15h1" /></>,
  oven: <><rect x="3.5" y="3" width="17" height="18" rx="2" /><path d="M3.5 8h17" /><rect x="6.5" y="11" width="11" height="7" rx="1" /><path d="M7 5.5h3" /></>,
  toaster: <><rect x="3" y="9" width="18" height="9" rx="2" /><path d="M7 9V7.5c0-.8.7-1.5 1.5-1.5h7c.8 0 1.5.7 1.5 1.5V9" /><path d="M19 12.5v2" /></>,
  kettle: <><path d="M6 9h10a4 4 0 0 1 4 4v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5" /><path d="M6 9 3 5.5" /><path d="M9 6h4" /></>,
  coffee: <><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" /><path d="M17 9.5h1.8a2.2 2.2 0 0 1 0 4.4H17" /><path d="M8 2c-.6 1.2.6 1.8 0 3M12 2c-.6 1.2.6 1.8 0 3" /></>,
  cleaning: <><path d="M12 2v8" /><path d="M8 10h8l1 5H7l1-5Z" /><path d="M8 15l-1 7M12 15v7M16 15l1 7" /></>,
  bath: <><path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3Z" /><path d="M6 12V5.5A2.5 2.5 0 0 1 8.5 3c1.2 0 2 .6 2.3 1.6" /><path d="M6 20l-1 2M18 20l1 2" /></>,
  shower: <><path d="M4 13h16" /><path d="M6 13V6.5A3.5 3.5 0 0 1 9.5 3h.5" /><path d="M8 16.5v1M12 16v2M16 16.5v1M10 19.5v1M14 19.5v1" /></>,
  bidet: <><path d="M4 11h16v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-4Z" /><path d="M8 11V5h8v6" /><path d="M10 8h4" /></>,
  toilet: <><path d="M6 3v8" /><path d="M4 11h13a5 5 0 0 1-4 4.9L12 21H9l-1-5.1A5 5 0 0 1 4 11Z" /><path d="M6 3h4" /></>,
  tv: <><rect x="2.5" y="4" width="19" height="12.5" rx="2" /><path d="M8 20.5h8M12 16.5v4" /></>,
  streaming: <><rect x="2.5" y="4" width="19" height="12.5" rx="2" /><path d="m10.5 8 4 2.3-4 2.3V8Z" /><path d="M8 20.5h8" /></>,
  cable: <><circle cx="12" cy="16" r="5" /><path d="m8 6 4 5 4-5" /><path d="M12 14.5v3" /></>,
  balcony: <><path d="M3 10h18M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" /><path d="M3 15h18" /><path d="M6 10V4h12v6" /></>,
  terrace: <><path d="M2 20h20" /><path d="M4 20v-6M9 20v-6M14 20v-6M19 20v-6" /><path d="M2 14h20" /><path d="M6 10c2-4 10-4 12 0" /></>,
  patio: <><path d="M12 3v3" /><path d="M3 11c1.5-3.5 5-5 9-5s7.5 1.5 9 5H3Z" /><path d="M12 11v10M9 21h6" /></>,
  garden: <><path d="M12 21V11" /><path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5Z" /><path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5Z" /><path d="M8 21h8" /></>,
  beach: <><path d="M2 19c2.5-1.6 4.5 1.6 7 0s4.5 1.6 7 0 4.5 1.6 6 .4" /><path d="M13 19V9" /><path d="M13 9c-3-2-6-1-7.5 1.5C8 9 11 9.5 13 9Z" /><path d="M13 9c3-2 6.5-1 8 1.5C18 9 15 9.5 13 9Z" /></>,
  view: <><path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.8" /></>,
  family: <><circle cx="8" cy="7" r="2.6" /><circle cx="16.5" cy="8.5" r="2" /><path d="M3 20c0-3 2.2-5 5-5s5 2 5 5" /><path d="M14 20c0-2.4 1.4-4 3.2-4S20 17.6 20 20" /></>,
  restaurant: <><path d="M6 2v8M4 2v5a2 2 0 0 0 4 0V2M6 10v12" /><path d="M17.5 2c-1.6 1.6-2.5 3.6-2.5 6 0 1.9.9 3 2.5 3.3V22" /></>,
  bar: <><path d="m4 4 8 8 8-8H4Z" /><path d="M12 12v8M8 20h8" /><path d="m15 7 4-4" /></>,
  sofa: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M2.5 12.5a1.7 1.7 0 0 1 3.4 0V16h12.2v-3.5a1.7 1.7 0 0 1 3.4 0V19H2.5v-6.5Z" /><path d="M5 19v2M19 19v2" /></>,
  wardrobe: <><rect x="4" y="2.5" width="16" height="19" rx="1.6" /><path d="M12 2.5v19" /><path d="M10 11v2M14 11v2" /></>,
  hanger: <><path d="M12 7a2 2 0 1 1 2-2c0 1.2-2 1-2 2Z" /><path d="M12 7 3.5 14c-1 .8-.5 2.4.8 2.4h15.4c1.3 0 1.8-1.6.8-2.4L12 7Z" /></>,
  plug: <><path d="M9 2v6M15 2v6" /><path d="M6 8h12v2a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z" /><path d="M12 16v6" /></>,
  floor: <><path d="M2 6h20M2 12h20M2 18h20" /><path d="M8 6v6M16 12v6M12 18v3M12 3v3" /></>,
  fan: <><circle cx="12" cy="12" r="2" /><path d="M12 10c0-4 1-6 3.5-6S18 8 14 10" /><path d="M14 14c3.5 2 5.5 4 4.2 6.2-1.2 2.2-4.2.5-4.2-4" /><path d="M10 14c-3.5 2-5.7 1.8-6.4-.6C3 11.2 6 10 10 10" /></>,
  hiking: <><circle cx="14" cy="4" r="1.8" /><path d="M12.5 21v-5l-2.5-2 1-5 3 2 2.5 1" /><path d="m10 9-3 2.5L5 21" /><path d="M19 21V8" /><path d="m19 8-2 1" /></>,
  kayak: <><path d="M2 15c3.5-2 6.5-2 10-2s6.5 0 10 2c-3.5 3-6.5 4-10 4s-6.5-1-10-4Z" /><path d="m5 4 14 9M19 4 5 13" /></>,
  fishing: <><path d="M3 5c8-2 14 2 17 7" /><path d="M20 12v4a3 3 0 0 1-6 0" /><path d="M3 5v3" /><path d="M11 19c1.5 1 3 1 4.5 0" /></>,
  boat: <><path d="M3 17h18l-2.5 4h-13L3 17Z" /><path d="M5 17V9l7-6 7 6v8" /><path d="M12 3v14" /></>,
  accessible: <><circle cx="12" cy="4.5" r="1.8" /><path d="M12 8v5h4" /><path d="M8 10a5.5 5.5 0 1 0 7.5 7.5" /><path d="M16 13l2.5 6" /></>,
  nosmoke: <><circle cx="12" cy="12" r="9" /><path d="m5.6 18.4 12.8-12.8" /></>,
  language: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.6 2.6 15.4 0 18-2.6-2.6-2.6-15.4 0-18Z" /></>,
  bed: <><path d="M3 18V7" /><path d="M3 11h18v7" /><path d="M3 18h18" /><circle cx="7.5" cy="8.5" r="1.8" /><path d="M11 11V8.5h6a2 2 0 0 1 2 2V11" /></>,
  cash: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 12h.01M18 12h.01" /></>,
  pet: <><ellipse cx="6" cy="10" rx="1.7" ry="2.3" /><ellipse cx="10.5" cy="7" rx="1.7" ry="2.4" /><ellipse cx="15" cy="7.5" rx="1.7" ry="2.3" /><ellipse cx="19" cy="11" rx="1.6" ry="2.1" /><path d="M12.5 12c2.8 0 5 2.3 5 4.6 0 2-1.6 3-3.4 2.6-1.1-.2-2.2-.2-3.3 0-1.8.4-3.4-.6-3.4-2.6C7.4 14.3 9.7 12 12.5 12Z" /></>,
  login: <><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /><path d="M10 8l4 4-4 4" /><path d="M14 12H3" /></>,
  logout: <><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" /><path d="M17 8l4 4-4 4" /><path d="M21 12H10" /></>,
  outdoor: <><path d="M4 20v-6M20 20v-6" /><path d="M2 14h20" /><path d="M6 14V9h12v5" /><path d="M9 9V6h6v3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  check: <><path d="m4 12.5 5 5L20 6.5" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  star: <><path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8L12 3Z" /></>,
  pin: <><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" /><path d="M18 14.4c2 .9 3 2.9 3 5.6" /></>,
  wa: <><path d="M3.5 20.5 5 16.4A8.4 8.4 0 1 1 8.2 19.6l-4.7.9Z" /><path d="M9 8.7c.3-.7 1.3-.6 1.6 0l.6 1.3c.1.3 0 .7-.3.9l-.5.4c.5 1.1 1.3 1.9 2.4 2.4l.4-.5c.2-.3.6-.4.9-.3l1.3.6c.6.3.7 1.3 0 1.6-2 .9-6.7-1.5-6.4-6.4Z" /></>,
  size: <><path d="M3 9V3h6M21 15v6h-6" /><path d="M3 3l7 7M21 21l-7-7" /></>,
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>,
  mail: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  ig: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r=".9" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></>,
  train: <><rect x="5" y="3" width="14" height="13" rx="3" /><path d="M5 10h14" /><circle cx="8.7" cy="13" r=".9" /><circle cx="15.3" cy="13" r=".9" /><path d="m7 16-2.5 5M17 16l2.5 5M8 21h8" /></>,
  plane: <><path d="M10.5 2.5 12 2l1.5.5.5 7.5 7 4v2l-7-2-.5 4.5 2.5 2v1.5L12 21l-4-1v-1.5l2.5-2L10 12l-7 2v-2l7-4 .5-7.5Z" /></>,
  museum: <><path d="M3 9.5 12 4l9 5.5" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v18" /><path d="M5 10v8M19 10v8" /><path d="M3 21h18M3 18h18" /></>,
  edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="M14 6.5 17.5 10" /></>,
  trash: <><path d="M4 7h16M9 7V4.5h6V7" /><path d="M6.5 7 7.5 21h9L17.5 7" /><path d="M10.5 11v6M13.5 11v6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  menu: <><path d="M3 8h18M3 16h18" /></>,
};

export default function Icon({ name, className = "w-5 h-5" }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.check}
    </svg>
  );
}
