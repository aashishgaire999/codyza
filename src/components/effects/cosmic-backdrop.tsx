export type CosmicVariant =
  | "hub"
  | "projects"
  | "groups"
  | "bounties"
  | "standup"
  | "settings"
  | "command"
  | "analytics"

const NODES = [
  [12, 24], [28, 13], [46, 31], [66, 16], [84, 28],
  [18, 68], [38, 78], [57, 60], [76, 74], [91, 56],
]

const DEEP_STARS = [
  [4, 9], [9, 43], [15, 88], [22, 52], [27, 92], [33, 5], [36, 39], [42, 70],
  [49, 8], [53, 89], [59, 42], [63, 95], [69, 51], [72, 7], [78, 87], [82, 43],
  [87, 8], [91, 91], [95, 36], [97, 66], [7, 77], [31, 64], [55, 21], [74, 35],
]

export function CosmicBackdrop({ variant }: { variant: CosmicVariant }) {
  return (
    <div className="cosmic-backdrop" data-cosmic-variant={variant} aria-hidden>
      <div className="cosmic-nebula cosmic-nebula-primary" />
      <div className="cosmic-nebula cosmic-nebula-secondary" />
      <div className="cosmic-aurora" />
      <div className="cosmic-orbit cosmic-orbit-one"><span className="cosmic-orbit-node" /></div>
      <div className="cosmic-orbit cosmic-orbit-two"><span className="cosmic-orbit-node" /></div>
      <div className="cosmic-orbit cosmic-orbit-three"><span className="cosmic-orbit-node" /></div>
      <svg className="cosmic-constellation" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M12 24 L28 13 L46 31 L66 16 L84 28 L91 56 L76 74 L57 60 L38 78 L18 68 L12 24 M46 31 L57 60 M28 13 L18 68 M66 16 L76 74" />
        <path className="cosmic-signal-path" d="M4 48 C18 37 24 59 38 48 S62 37 75 49 S90 59 98 45" />
      </svg>
      <div className="cosmic-deep-field">
        {DEEP_STARS.map(([x, y], index) => (
          <span
            key={`deep-${x}-${y}`}
            className="cosmic-dust"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${index * -0.61}s`, animationDuration: `${9 + (index % 5) * 2}s` }}
          />
        ))}
      </div>
      {NODES.map(([x, y], index) => (
        <span
          key={`${x}-${y}`}
          className="cosmic-star"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${index * -0.73}s`, animationDuration: `${7 + (index % 4) * 1.8}s` }}
        />
      ))}
      <span className="cosmic-meteor cosmic-meteor-one" />
      <span className="cosmic-meteor cosmic-meteor-two" />
      <span className="cosmic-meteor cosmic-meteor-three" />
      <div className="cosmic-scan" />
    </div>
  )
}
