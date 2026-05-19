"use client";
import Image from "next/image";
import type { Partner } from "@/lib/constants";

interface PartnerAvatarProps {
  partner: Partner;
  isActive?: boolean;
  onClick?: () => void;
  size?: number;
}

export function PartnerAvatar({
  partner,
  isActive = false,
  onClick,
  size = 80,
}: PartnerAvatarProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full overflow-hidden border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        isActive
          ? "border-gold shadow-[0_0_20px_rgba(228,199,83,0.35)]"
          : "border-transparent hover:border-gold/50"
      }`}
      style={{ width: size, height: size, flexShrink: 0 }}
      aria-label={partner.name}
      aria-pressed={isActive}
    >
      <Image
        src={partner.photo}
        alt={partner.name}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </button>
  );
}
