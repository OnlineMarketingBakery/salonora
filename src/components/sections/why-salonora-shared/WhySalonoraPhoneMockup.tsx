import Image from "next/image";

/** Figma 346:6142 — 324×443 clipped phone mockup (transparent outside frame). */
const PHONE_SPRITE = "/images/why-salonora/phone-sprite.png";
const PHONE_PERSON = "/images/why-salonora/phone-person.png";
const PHONE_ROSE_GLOW = "/images/why-salonora/phone-rose-glow.svg";
const PHONE_LOGO = "/images/why-salonora/phone-logo.svg";
const PHONE_NOTCH_DECO = "/images/why-salonora/phone-notch-deco.svg";

export function WhySalonoraPhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full max-w-[417px] shrink-0 overflow-hidden max-lg:aspect-[324/443] lg:aspect-auto lg:h-[443px] lg:w-[324px] lg:max-w-[324px] ${className}`}
      aria-hidden
    >
      {/* Figma 346:6143 — phone chrome (667px tall, clipped to 443px from top) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[150.79%] overflow-hidden">
        <Image
          src={PHONE_SPRITE}
          alt=""
          width={324}
          height={667}
          unoptimized
          className="absolute max-w-none"
          style={{
            height: "115.44%",
            width: "237.65%",
            left: "-68.91%",
            top: "-7.65%",
          }}
          draggable={false}
        />
      </div>

      {/* Figma 346:6144 — rose glow behind person */}
      <div className="pointer-events-none absolute left-[13px] top-[293px] h-[150px] w-[300px] max-lg:left-[4.01%] max-lg:top-[66.14%] max-lg:h-[33.86%] max-lg:w-[92.59%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHONE_ROSE_GLOW}
          alt=""
          className="block size-full max-w-none object-fill"
          draggable={false}
        />
      </div>

      {/* Figma 346:6146 — person photo crop */}
      <div className="pointer-events-none absolute left-[34px] top-[105px] h-[338px] w-[241px] overflow-hidden max-lg:left-[10.49%] max-lg:top-[23.7%] max-lg:h-[76.3%] max-lg:w-[74.38%]">
        <Image
          src={PHONE_PERSON}
          alt=""
          width={241}
          height={338}
          unoptimized
          className="absolute max-w-none"
          style={{
            height: "261.74%",
            width: "244.38%",
            left: "-74.89%",
            top: "-59.49%",
          }}
          draggable={false}
        />
      </div>

      {/* Figma 346:6147 — Salonora logo lockup */}
      <div className="pointer-events-none absolute inset-[16.7%_31.7%_79.46%_42.28%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHONE_LOGO}
          alt=""
          className="block size-full max-w-none object-contain"
          draggable={false}
        />
      </div>

      {/* Figma 346:6157 — status island decoration */}
      <div className="pointer-events-none absolute inset-[14.22%_59.65%_76.45%_31.48%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHONE_NOTCH_DECO}
          alt=""
          className="block size-full max-w-none object-contain"
          draggable={false}
        />
      </div>

      {/* Figma 346:6145 — dynamic island crop from phone sprite */}
      <div className="pointer-events-none absolute left-[121px] top-[20px] h-[22px] w-[84px] overflow-hidden rounded-[12px] max-lg:left-[37.35%] max-lg:top-[4.51%] max-lg:h-[4.97%] max-lg:w-[25.93%]">
        <Image
          src={PHONE_SPRITE}
          alt=""
          width={84}
          height={22}
          unoptimized
          className="absolute max-w-none"
          style={{
            height: "3500%",
            width: "916.67%",
            left: "-409.83%",
            top: "-322.73%",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
