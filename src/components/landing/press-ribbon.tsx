import Image from "next/image"
import { FEATURED_IN } from "@/constants/landing"

export function PressRibbon() {
  const items = [...FEATURED_IN, ...FEATURED_IN]

  return (
    <section className="cz-press-ribbon" aria-label="Codyza profiles and coverage">
      <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <p className="cz-press-label">find us on</p>
        <div className="cz-press-window">
          <div className="cz-press-track">
            {items.map((item, index) => (
              <a
                key={`${item.name}-${index}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cz-press-item"
                aria-label={`View Codyza on ${item.name}`}
                aria-hidden={index >= FEATURED_IN.length}
                tabIndex={index >= FEATURED_IN.length ? -1 : undefined}
              >
                <span className="cz-press-logo">
                  <Image
                    src={item.logo}
                    alt=""
                    width={item.logoWidth}
                    height={item.logoHeight}
                    sizes="180px"
                  />
                </span>
                <span>{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
