import Icon from "./Icon";

export default function MapEmbed({ lat, lng, label, zoomBox = 0.012 }: { lat: number; lng: number; label: string; zoomBox?: number }) {
  const bbox = [lng - zoomBox, lat - zoomBox * 0.6, lng + zoomBox, lat + zoomBox * 0.6].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="shell">
      <div className="core overflow-hidden">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[calc(var(--radius-core)-0.25rem)] bg-shell">
          <iframe title={`Mapa de ${label}`} src={src} loading="lazy"
            className="h-full w-full border-0 grayscale-[0.35] saturate-[0.85] transition-all duration-700 hover:grayscale-0 hover:saturate-100" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="flex items-center gap-2 text-[13.5px] text-ink-70">
            <Icon name="pin" className="h-4 w-4 text-palm" />{label}
          </p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
            className="ul-slide text-[13px] text-ink-45 hover:text-ink">Abrir en Google Maps</a>
        </div>
      </div>
    </div>
  );
}
