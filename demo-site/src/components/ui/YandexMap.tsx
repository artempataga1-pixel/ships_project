"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { CONTACTS } from "@/lib/constants";

declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void;
      Map: new (
        container: HTMLElement,
        state: Record<string, unknown>
      ) => {
        geoObjects: { add: (obj: unknown) => void };
      };
      Placemark: new (
        coords: [number, number],
        props: Record<string, string>,
        opts: Record<string, string>
      ) => unknown;
    };
  }
}

export function YandexMap({ apiKey }: { apiKey?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const initMap = () => {
    if (!window.ymaps || !containerRef.current || initialized.current) return;
    initialized.current = true;

    window.ymaps.ready(() => {
      const map = new window.ymaps!.Map(containerRef.current!, {
        center: CONTACTS.mapCenter,
        zoom: CONTACTS.mapZoom,
        controls: ["zoomControl"],
      });
      const mark = new window.ymaps!.Placemark(
        CONTACTS.mapCenter,
        { balloonContent: CONTACTS.address },
        { preset: "islands#goldIcon" }
      );
      map.geoObjects.add(mark);
    });
  };

  useEffect(() => {
    if (window.ymaps) initMap();
  }, []);

  const src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${apiKey ? `&apikey=${apiKey}` : ""}`;

  return (
    <>
      <Script src={src} strategy="lazyOnload" onLoad={initMap} />
      <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden bg-muted" />
    </>
  );
}
