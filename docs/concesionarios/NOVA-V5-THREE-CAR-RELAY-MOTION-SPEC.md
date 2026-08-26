# NOVA V5 — THREE-CAR RELAY + INERTIA

## Status
Implementation task. This document is the source of truth for the next motion iteration of NOVA MOTORS.

Do not simplify this task into a normal next/prev carousel. If implementation doubt appears, re-check this document and the approved Polestar reference video before changing code. If doubt remains after that, ask the project owner before inventing a new behaviour.

---

## 1. Approved reference

Reference behaviour: premium Polestar-style full-viewport automotive slider.

Key visual premise:

```text
[ previous car, partially visible ]   [ HERO CAR ]   [ next car, partially visible ]
```

The camera is fixed. The world moves horizontally.

The interaction must feel like a physical premium vehicle catalogue with inertia, drag, momentum, snap and editorial synchronization.

---

## 2. Architecture that remains from V4

KEEP:
- isolated `.nova-track-stage`;
- `.nova-car` visual nodes;
- donor Restaurant Store / Studio / IndexedDB / general DOM infrastructure;
- donor orbit hidden and unable to control visible NOVA cars;
- six-vehicle circular data model;
- NOVA copy and vehicle detail;
- responsive shell;
- bottom navigation / giant background glyph / hotspot as editorial layers.

DO NOT restore the donor orbit as visual owner.

---

## 3. Problem in V4

V4 solved isolation and the three-car composition, but its motion is still too simple.

Current conceptual behaviour is approximately:

```text
track translation
+ scale/opacity by distance
+ fixed timeline
+ overshoot
+ settle
```

That is functional but does not reproduce the approved Polestar choreography.

The reference is a three-car relay in which outgoing, incoming and next-up vehicles have distinct roles during the same continuous movement.

---

## 4. Core motion model

V5 must be named:

`NOVA CHOREOGRAPHY V5 — THREE CAR RELAY + INERTIA`

The core motion has three simultaneous systems:

1. TRACK TRANSLATION
   - the physical row moves continuously in X;
   - strict 2D horizontal translation;
   - zero 3D rotation.

2. AUTHORITY TRANSFER
   - outgoing hero progressively gives up visual authority;
   - incoming vehicle gains scale, opacity, clarity and z-order before reaching exact centre;
   - authority is not a simple on/off active state.

3. RECOMPOSITION
   - while the incoming becomes hero, a new next-up vehicle is progressively revealed at the opposite edge;
   - after lock, the layout returns to a stable three-car composition.

---

## 5. Role model

Every transition must explicitly reason about these roles:

- OUTGOING
- CURRENT / HERO
- INCOMING
- NEXT-UP

Example forward transition from B to C:

```text
REST
A partial     B HERO      C partial

PREPARE
A moves       B starts    C gains presence
              yielding

TRAVEL
A exits       B travels   C approaches centre     D starts appearing

TAKEOVER
              B becomes   C becomes dominant      D becomes next-up
              left neigh.

LOCK
              B partial   C HERO                  D partial
```

The fourth vehicle can be offscreen or almost invisible at rest, but must start participating during recomposition.

---

## 6. Drag + momentum + snap

The reference behaves as a draggable canvas, not only as next/previous buttons.

Required behaviour:

- pointer/touch drag maps directly to continuous track progress;
- drag must feel 1:1 with the pointer during the gesture;
- release velocity matters;
- momentum/deceleration continues after release;
- final position snaps to the nearest valid vehicle centre;
- low velocity + short drag may snap back;
- high release velocity may commit the next slide even if distance is smaller;
- next/prev buttons and keyboard call the same motion system, not a different animation.

GSAP is allowed and preferred. If GSAP Draggable/InertiaPlugin is available, use it. If InertiaPlugin is not available in the current runtime, reproduce the physics deterministically with measured release velocity + deceleration + snap. Do not block implementation on a paid plugin.

---

## 7. Physics and easing

Premium automotive behaviour:

- fast but controlled initial travel;
- long, heavy deceleration;
- very small centre overshoot, if any;
- almost imperceptible correction into lock;
- no playful bounce;
- no orbit-like motion;
- no vertical bobbing;
- no 3D rotation.

Target feel:

```text
DRAG / IMPULSE
→ acceleration / carry
→ long deceleration
→ micro centre pass
→ exact snap lock
```

The reference should feel like moving mass, not moving cards.

---

## 8. Three-car rest composition

At rest on desktop:

- hero centred precisely;
- previous neighbour visibly present at left;
- next neighbour visibly present at right;
- neighbour visible fraction should be substantial, approximately 30–50% depending on vehicle proportions;
- hero opacity = 1;
- neighbours remain solid and readable, not blurred into background;
- all vehicles share a coherent wheel baseline;
- central car may gain subtle authority by scale/brightness, but lateral cars must still clearly read as full vehicles.

Do not regress to:

```text
small tip   HUGE HERO   small tip
```

---

## 9. Parallax / depth

Parallax is subtle 2.5D, not orbit geometry.

Allowed:
- slight differential scale;
- slight differential opacity;
- slight timing offset in authority transfer;
- next-up reveal arriving later than main track translation.

Avoid:
- strong blur;
- large perspective shifts;
- rotation;
- vertical orbit;
- dramatic depth changes.

---

## 10. Editorial synchronization must follow progress

Do not drive all editorial elements only from fixed timeline timestamps.

They must derive from normalized transition progress where possible.

Outgoing copy:
- remains readable during early movement;
- fades/moves slightly down/up as takeover approaches.

Incoming copy:
- begins only once incoming car has clear visual authority;
- fades from opacity 0 to 1;
- subtle `translateY(20px -> 0)` style motion.

Giant background glyph:
- separate slower layer;
- old glyph exits subtly;
- new glyph enters with a different temporal curve from the cars;
- should feel like background scenery.

Hotspot:
- visually attached to the current hero car;
- moves with car geometry;
- transfers ownership only when incoming car becomes dominant.

Bottom indicator:
- outgoing bar decreases while incoming bar increases according to transition progress;
- one clear active authority after lock.

---

## 11. Suggested progress map

This is a direction guide, not a blind timer table:

```text
TRACK TRANSLATION      0%  ───────────────────────────── 100%
AUTHORITY TRANSFER          15% ───────────────── 88%
NEXT-UP REVEAL                    30% ───────────────── 100%
OLD COPY FADE                         45% ─────── 72%
NEW COPY IN                                 68% ───────── 100%
HOTSPOT TRANSFER                             62% ───── 88%
GLYPH TRANSITION                       40% ───────────── 100%
INDICATOR                         20% ───────────────── 100%
```

The cars control the narrative. Copy never gets ahead of the product.

---

## 12. Vehicle normalization

Because source vehicles have different framing/proportions, each vehicle may need explicit visual calibration:

- `visualScale`
- `baselineY`
- `visualWidth` / optional X correction
- `hotspotAnchor`

Goal: all tyres appear to sit on the same virtual floor.

Do not allow source-image framing to create floating cars or inconsistent scale.

---

## 13. Assets

Canonical source images are the six repository PNG files under `/imagenes`.

Known current limitation: the source PNGs may still include solid magenta/red backgrounds. Final production assets must be transparent or visually isolated on the clean white/neutral NOVA stage.

Motion implementation and asset cleanup are separate concerns. Do not reintroduce runtime chroma-key canvas processing.

---

## 14. Secondary sections

Tesla/NOVA vehicle imagery must also appear in:
- Hero;
- Design & Engineering;
- Driving Experience;
- Expert Guidance.

Do not leave inherited restaurant imagery or purple placeholder backgrounds.

---

## 15. QA acceptance gates

A test is not enough if the screenshot does not show the intended composition.

Required automated + visual gates:

### REST
- three vehicles visibly present;
- hero centre within tolerance;
- left/right neighbour visibility >= meaningful threshold;
- wheel baseline coherent;
- hero has greater visual authority but neighbours remain readable.

### DRAG
- pointer movement maps continuously to track movement;
- vehicle positions follow drag before release;
- no discrete slide jump during active drag.

### RELEASE / INERTIA
- release velocity affects continuation;
- track decelerates rather than stopping instantly;
- snap ends precisely at centre;
- no visible bounce.

### RELAY
At mid transition:
- outgoing still visible;
- incoming clearly gaining authority;
- next-up begins to appear;
- more than one car carries meaningful visual weight.

### EDITORIAL
- copy does not switch at transition start;
- new copy appears after visual takeover;
- giant glyph, hotspot and progress indicator synchronize with slide progress.

### ISOLATION
- donor `renderOrbit()` cannot move visible `.nova-car` nodes;
- visible NOVA stage remains stable after lock.

### VISUAL EVIDENCE
- screenshots/crops must show the actual vehicle showcase, not Hero or another section;
- screenshots required at rest, mid-transition, takeover and final lock.

---

## 16. Implementation order

1. Keep V4 isolated stage.
2. Replace simple distance-only authority logic with explicit relay-role calculations.
3. Introduce continuous drag progress.
4. Measure pointer velocity.
5. Add inertia/deceleration/snap.
6. Bind buttons/keyboard/wheel to same state machine.
7. Drive editorial layers from normalized progress.
8. Add next-up reveal curve.
9. Normalize baselines per vehicle.
10. Update QA to capture REST / MID / TAKEOVER / LOCK.
11. Inspect screenshots manually against approved video.
12. Only after motion is approved, finalize transparent asset cleanup.

---

## 17. Non-negotiable rule

Do not call V5 complete merely because navigation works or tests are green.

V5 is complete only when a human looking at the browser can recognize the approved Polestar-style choreography:

**drag + inertia + three-car relay + premium deceleration + progress-driven editorial sync.**
