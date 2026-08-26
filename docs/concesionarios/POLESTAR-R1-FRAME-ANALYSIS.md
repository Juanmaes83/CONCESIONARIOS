# POLESTAR REFERENCE — FRAME ANALYSIS / CORRECTION R1

## Why this document exists

This note supersedes the earlier assumption in `NOVA-V5-THREE-CAR-RELAY-MOTION-SPEC.md` that the approved reference is strict 2D translation with zero rotation.

A frame-by-frame re-analysis of the approved reference video proves that this assumption was incomplete and was one major reason V4/V5 still looked too simple.

## Verified transition signature

Measured transition window: approximately 2.00s–4.75s of the approved reference.

- 2.00–2.50s: current hero is nearly side-on / orthographic.
- ~2.75s: outgoing vehicle visibly presents a rear three-quarter attitude while incoming vehicle enters with a front three-quarter attitude.
- ~3.00s: maximum perspective cross; outgoing and incoming simultaneously carry opposite perspective attitudes and meaningful visual authority.
- ~3.25s: incoming vehicle recovers toward side profile as it takes the centre.
- 3.50–4.50s: new hero is locked cleanly; new neighbour is already recomposing at the opposite edge.

## Corrected model

The reference is not adequately described as only:

`translateX + opacity + scale + inertia`.

The visible motion language is:

`continuous X track + opposite yaw/perspective + depth transfer + authority transfer + next-up recomposition + heavy deceleration + lock`.

The implementation may use DOM/CSS/GSAP perspective rather than real 3D geometry, but the browser must visibly reproduce the perspective relay.

## Required visual roles

### Hero at rest
- almost flat / side-on;
- maximum authority;
- highest depth / cleanest scale.

### Left neighbour
- partial;
- visibly yawed in one direction;
- lower depth than hero.

### Right neighbour
- partial;
- visibly yawed in the opposite direction;
- lower depth than hero.

### During forward relay
- outgoing: yaw increases toward rear-three-quarter illusion as it exits left;
- incoming: enters with opposite/front-three-quarter illusion and progressively flattens toward 0 degrees as it reaches centre;
- next-up: begins to reveal before final lock;
- new hero: returns to approximately 0 degree yaw at exact centre.

## Acceptance gates added after failed V5 human review

A version MUST NOT be called improved merely because the code changed or QA is green.

At the mid-cross screenshot:
1. outgoing role must exist;
2. incoming role must exist;
3. next-up role must already participate;
4. outgoing and incoming must show clearly visible, opposite yaw/perspective;
5. horizontal displacement must already be substantial;
6. both outgoing and incoming must carry meaningful visual weight simultaneously.

At final lock:
1. incoming car becomes exact centre hero;
2. hero yaw returns approximately to zero;
3. neighbours remain visibly present;
4. editorial copy changes after product takeover, not at transition start.

## Process rule

When implementation doubt appears:
1. review this document;
2. review the approved reference video frame-by-frame;
3. only if ambiguity remains, ask the project owner before inventing behaviour.

Human visual recognition of the approved reference is the decisive acceptance criterion.