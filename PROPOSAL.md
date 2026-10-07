# The Attention Lab — Final Portfolio Proposal for Jay Rajput

## Direction update (Path B)

The full 3D corridor of rooms is replaced. Structure is now: 01 Opening (3D), 02 Hero lab (3D), then smooth scroll sections: 03 Proof strip, 04 Case studies, 05 Retention theatre, 06 Range wall, 07 About and services, 08 DM ending. Sections 03-08 are HTML/CSS with GSAP + Lenis motion and light 3D touches (tilt, depth, parallax), not 3D rooms. The Zero-lag budget, the /content rules and the 5-part case study format still apply.

Oct 5, 2026

## Executive summary

Build **The Attention Lab**: a cinematic, Instagram-first portfolio that makes visitors feel Jay's skill, backed by the operational proof agencies and brands need before they hire. This merges the strongest idea from each proposal: the Attention Lab's concept and experience, and the Content Ops Factory's audience focus, proof system and buildable scope.

The guiding principle stays the same: *don't build a portfolio that looks like social media; build one that behaves like great social media.* The site should stop the visitor, hold their attention, prove results, and convert them into a DM, exactly as Jay's content does.

The experience is fully 3D: one continuous cinematic world where every section is a room the camera glides through, built for buttery 60fps motion. Discipline still applies: real work stays the brightest thing on screen, a 2D reading view is always one tap away, and the world never makes a visitor wait to see Jay's work.

## Analysis of the two proposals

The Attention Lab has the better idea; the Content Ops Factory has the better plan. Neither is right on its own.

| Criterion | The Attention Lab | 3D Content Ops Factory | Winner |
| --- | --- | --- | --- |
| Core idea | The portfolio behaves like great social media and proves the skill by doing it | The portfolio is a production pipeline that proves process and scale | Attention Lab |
| Positioning | Strategist who wins attention; premium and ownable | Content Operations Lead; reliable but undersells creativity | Attention Lab |
| Target audience | Never named clearly | Agency hiring directors, with a clear list of what they need | Factory |
| First impression | Cinematic "STOP. YOU DID." opening; memorable | Isometric voxel diorama; can read as toy-like | Attention Lab |
| Proof of skill | Retention Theatre, Strategy Room, Results Wall | Multi-niche range, sample client reporting, hook breakdowns | Tie; combine both |
| Case study format | 7 parts; thorough but long | 4 parts; fast for busy readers | Factory |
| Build effort | Heavy: Next.js, R3F, GSAP, custom Blender assets | Moderate: Spline + Framer/Webflow | Factory |
| Risk | Long intro and too many sections can slow a recruiter | "Factory" metaphor and conveyor belt can feel gimmicky; overclaims like guaranteed 60fps | Even |

**Kept from the Attention Lab:** the concept, name, hero line, opening sequence, dark editorial look, Instagram-native layer, Retention Theatre, Strategy Room and DM contact.

**Kept from the Factory:** a named target audience, the multi-niche range section, a sample client report, timestamped hook breakdowns, a shorter case study format, the leaner build path and the phased roadmap.

**Dropped:** the conveyor belt and voxel diorama, the "factory" framing, unverifiable claims (guaranteed 60fps on any device, blanket 70%+ watch-through), and the Attention Lab's eight separate lab sections, which fold into fewer, richer 3D rooms.

## Positioning and target audience

Jay is positioned as a **Social Media Manager who creates attention and can run it at scale**: creative instinct plus repeatable systems.

**Identity line:** JAY RAJPUT, Social Media Manager. Instagram · Content · Strategy · Growth.

**Hero statement:** I make people stop scrolling.

**Supporting line:** Ideas that stop the scroll. Systems that keep it working, across every brand I manage.

The site serves two audiences, in this order:

| Audience | What they need to see | Where they find it |
| --- | --- | --- |
| Agency hiring managers (primary) | Range across brand voices, handling several accounts, short-form skill, client-ready reporting | Range Wall, Case Files, Report Room, Retention Theatre |
| Brands and founders hiring directly | Results, a clear process, services and an easy way to start | Results, Strategy Room, Services, DM contact |

Open question for Jay: if he is only pursuing one of these right now, the copy and the order of sections should lean fully toward that audience.

## Visual direction

The look is premium dark editorial with restrained Instagram DNA. Real work is always the brightest thing on screen; effects only support it.

| Element | Direction |
| --- | --- |
| Mood | Cinematic, editorial, confident, calm |
| Environment | Dark architectural studio with vertical media walls, not a cartoon or diorama |
| Colour | Near-black, warm white, one restrained Instagram-inspired accent used only for actions and highlights |
| Typography | Large editorial headlines; clean modern UI type for interface elements |
| Motion | Slow camera moves, smooth transitions, purposeful micro-interactions |
| UI | Instagram-familiar patterns (grid, Reels, Highlights, DMs) without cloning Instagram |
| Avoid | Neon, gamer aesthetics, voxel/toy 3D, heavy gradients, decorative motion |

## The 3D world

The whole portfolio lives inside one continuous 3D world: the visitor never leaves the Lab, and every section is a place the camera glides to. Content still appears on screens and surfaces inside the world, with a crisp 2D reading view one tap away for long text.

### The space

A dark, cinematic architectural studio: tall concrete and plaster walls, a polished reflective floor, deep shadows and soft beams of light cutting through faint haze. Screens inside the world are the main light source, so Jay's work literally lights the room. Every object is modelled in a premium, realistic style, never low-poly or toy-like.

### Room by room

| Moment | What is built in 3D | Interaction |
| --- | --- | --- |
| Opening | Vertical video screens floating in total darkness, multiplying as the visitor watches | On "STOP." every screen freezes mid-air; the camera pulls back through them into the Lab |
| Profile hub | A monumental media wall: Jay's profile at the top, the 9-post grid as nine tall glowing screens, Highlights as lit rings on the floor | Hover tilts and brightens a tile; click flies the camera into that room |
| Case Files | A long gallery corridor of tall suspended glass panels, one per campaign, with the hero result etched on each | Panel rotates to face the visitor and expands; Reels play on its surface |
| Retention Theatre | A screening room with one giant vertical screen; the retention curve is a 3D ribbon of light running along the floor in front of it | Scrubbing the video moves a glowing marker along the ribbon; drops and spikes rise as physical peaks with labels |
| Range Wall | Three tall phone-shaped monoliths, each lit in its brand's colours, slowly rotating | Click one: it turns, its screen fills with that brand's feed and captions |
| Strategy Room | A dark table with floating cards (insight, objective, pillar, hook, format, CTA, distribution) orbiting a central screen | Drag or click a card into its slot; the post on the screen rebuilds live |
| Report Room | Large 3D numbers standing in space, with bar charts that grow up out of the floor | Bars animate from baseline to result; the monthly report opens on a glass panel |
| Results Wall | Key metrics as huge sculptural figures (views, reach, saves) mounted on the wall, each linked to its campaign | Hover lights the campaign behind the number |
| About + Services | A personal studio corner: phone on tripod, ring light, camera, notebook, softly lit | Objects reveal the About story and services list |
| DM exit | A single phone on a pedestal under a spotlight at the end of the space | Phone lifts toward the camera and becomes the DM chat |

### Ambient details

- Faint floating dust in the light beams, used sparingly.
- Screen glow reflecting on the floor and walls in real time.
- Subtle cursor parallax: the camera drifts slightly as the mouse moves, so the space always feels alive.
- Soft spatial sound (optional, off by default): a low room tone and a gentle click when screens activate.

### Crazy-level smoothness

The target is a locked 60fps on a normal laptop and 120fps on high-refresh screens, with no stutter during camera moves. These choices make that possible:

- **Guided camera on spline paths.** The camera glides along pre-designed curves with eased acceleration, never jerky free movement. Scroll and clicks move it along the path.
- **Smooth scroll engine.** Lenis-style inertial scrolling tied to the camera, so scrolling feels like gliding.
- **Physics-based easing.** Spring easing on every hover, tilt and panel transition, so motion settles naturally instead of stopping dead.
- **Baked lighting.** Lighting and shadows are calculated once when the scene loads and then frozen, so the GPU only draws, never recalculates lighting during motion.
- **Compressed assets.** Draco/Meshopt-compressed models and KTX2 textures keep downloads small and GPU memory low.
- **One scene, streamed.** A single persistent world; rooms load in the background as the visitor approaches, so there are no loading screens between sections.
- **Video as textures, played only on screen.** Reels play only when visible and pause off-screen.
- **Restrained post-processing.** Light bloom and depth of field only; film grain and heavy effects are skipped if they cost frames.
- **Adaptive quality.** The site measures frame rate and quietly lowers resolution or effects on weaker devices to keep motion smooth.
- **A real loader.** A minimal, branded preloader shows progress while the core world loads, then the opening starts instantly.

### Zero-lag performance budget

Smoothness is treated as a hard requirement, not a finishing touch: every room must stay inside these limits before it ships, and anything that breaks them is simplified or cut.

| Budget | Desktop / laptop | Mobile |
| --- | --- | --- |
| Frame time | Under 16.7 ms every frame (60fps); under 8.3 ms on 120Hz screens | Under 16.7 ms (60fps) |
| Dropped frames during camera moves | Zero visible stutters | Zero visible stutters |
| Triangles on screen at once | Under 500,000 | Under 150,000 |
| Draw calls per frame | Under 100 | Under 50 |
| Texture memory | Under 256 MB | Under 96 MB |
| Videos playing at once | 1 (others show a still frame) | 1 |
| First download before the opening plays | Under 5 MB | Under 3 MB |
| Time to opening | About 3 seconds | About 4 seconds |

**Hard rules for the developer**

- No heavy work during motion: models, textures and videos load and decode only while the camera is still or between rooms, never mid-glide.
- All assets for the next room are preloaded and warmed up on the GPU before the camera arrives, so nothing pops in.
- Shaders are compiled at load time, never the first time an object appears (the most common cause of a one-off stutter).
- Repeated objects (panels, cards, screens) use instancing so they cost one draw call, not dozens.
- Animations run on the GPU or in the render loop; nothing animates through page layout, which causes jank.
- No real-time shadows or live lights beyond one or two; all other lighting is baked.
- Off-screen rooms stop rendering and their videos pause.
- Device check on load: weaker GPUs get lower resolution and fewer effects automatically, before the visitor notices any drop.

**How smoothness is proven before launch**

- Profiled on a mid-range Windows laptop, a MacBook, a mid-range Android phone and an iPhone, not just the developer's powerful machine.
- Every camera path recorded and checked frame by frame for drops.
- Launch is blocked until every room passes on every test device.

No website can guarantee smoothness on every old or overloaded device, so the adaptive quality system's job is to protect motion first: it lowers detail before it ever lets the camera stutter.

### Mobile

Mobile gets a lighter version of the same world, not a separate site: fewer objects, lower-resolution textures, and the camera moved by vertical swipe along the same path. Every room still exists; it just renders more simply.

## The opening sequence

The opening proves the pitch in about 6 seconds, and a **Skip** button is visible from the first frame so no recruiter is ever trapped.

1. Black screen. A vertical clip of Jay's real work starts playing, with no explanation.
2. A second clip appears, then a third. The visitor instinctively watches.
3. Everything stops abruptly.
4. Large type: **STOP.** After a beat: **YOU DID.** Small line: *That's the job.*
5. The camera pulls back to reveal the Lab, and the identity appears: Jay Rajput, Social Media Manager.
6. Two clear choices: **Explore the Lab** or **View work directly**.

Rules: the opening plays once per visitor, respects reduced-motion settings (showing a still version instead), and uses only real clips from Jay's work.

## Experience architecture

The Instagram profile is the hub: whichever path a visitor takes from the opening, they land on Jay's profile and 9-post grid, open rooms from there, and are always one tap from a DM.

**Visitor journey (every path ends in a DM):**

1. Opening: STOP. YOU DID.
2. Visitor chooses **Explore the Lab** or **View work directly**.
3. Both paths land on the hub: **Profile + 9-post grid**.
4. From the grid or Highlights, the visitor opens any Lab room: Case Files, Retention Theatre, Range Wall, Report Room, Strategy Room, About + Services.
5. From any room: **DM contact** (Hiring or Project).

The rooms replace the original eight lab sections; Observe, Ideate, Distribute and Retain fold into the Strategy Room and Retention Theatre rather than standing alone.

| Instagram element | Role in the site |
| --- | --- |
| Profile | Entry hub: bio, proof numbers, main CTA |
| 9-post grid | Each tile opens a case study, room or contact |
| Highlights | Navigation: Work, Strategy, Results, Services, About |
| Reels | Short-form showcase that feeds the Retention Theatre |
| Stories | Process clips, behind-the-scenes and quick testimonials |
| DM | The contact form |

## Signature features

Four interactive features turn Jay's claims into things a visitor can see for themselves. Each one exists because it proves a specific hiring criterion.

### Retention Theatre (launch)

A vertical Reel plays beside a retention curve that moves with the video as the visitor scrubs. Labelled moments mark the hook, pattern interrupt, reveal, payoff and CTA, with a short note on why each edit was made. This proves short-form mastery better than any claim of watch-through rates.

### Range Wall (launch)

Three phone frames side by side, each showing a different brand voice, Community (Indian Corporate Life, Relatable Office Memes), Character (Corporate Dadi, Corporate Nani) and Brand (Flipkart, Realme, Lava, Jio Hotstar, Wellbeing Nutrition). Tapping one opens its feed, a sample caption and the related case study. This answers the agency's first question: can Jay switch voices without quality dropping? Only include niches Jay has real work in.

### Report Room (launch)

A short, anonymized monthly client report: headline results, non-follower reach, saves and shares, a "what worked" panel and a "testing next" panel. It shows Jay can talk to clients and account leads in business terms, not only post content.

### Strategy Room (launch)

A campaign assembled from building blocks: audience insight, objective, content pillar, hook, format, CTA and distribution. Visitors switch one block (say, the hook) and see how the final post changes. This positions Jay as a strategist rather than an operator.

## Case study framework

Every case study uses the same five parts and opens with its headline result, so a hiring manager gets the point in 10 seconds and the detail if they keep reading.

| Part | What it covers | Format |
| --- | --- | --- |
| 0. Headline result | The single most impressive verified outcome | One large editorial number + one line |
| 1. Brief and baseline | Who the client was, the starting numbers, the goal | 2–3 sentences + baseline stats |
| 2. Insight and idea | The audience observation and the creative concept it led to | Short paragraph + content pillars |
| 3. Execution and distribution | The Reels, carousels, stories and captions, plus timing and cadence | 2 Reels with timestamped hook breakdowns, 1 carousel, caption samples |
| 4. Results and learning | Baseline vs. result, and what Jay would do differently | Before/after chart + 2–3 sentences |

Launch with 3 or 4 case studies chosen to show range across different niches. Every metric must be verified, ideally with a screenshot of native insights, and tied to an outcome rather than shown as a vanity number.

## Contact and conversion

The main call to action is a DM-style conversation that is really a short lead form, with two separate paths so each audience gets the right questions.

- **Hiring (agencies and companies):** role, company, location or remote, and a link to the job post. Shows a downloadable CV and LinkedIn link.
- **Project (brands and founders):** what they need, goal, budget range, timeline and contact details.

The chat asks one question at a time with quick-reply buttons, sends a friendly confirmation, and delivers each enquiry to Jay's email or CRM. A plain email address and Instagram handle stay visible for anyone who prefers them. Every major section ends with a small "Message Jay" prompt so the visitor never has to search for it.

## Technical direction and performance rules

A 3D-first world at this level of polish needs a code-based stack and a developer experienced in WebGL; no-code tools like Framer or Spline cannot deliver this smoothness on their own.

| Layer | Choice |
| --- | --- |
| Framework | Next.js + TypeScript |
| 3D engine | Three.js via React Three Fiber, with Drei helpers |
| Camera and motion | GSAP (ScrollTrigger) for camera paths, Lenis for smooth scroll, spring physics for interactions |
| Post-processing | React Postprocessing: subtle bloom and depth of field |
| 3D assets | World built in code from simple geometry and premium materials; a few props from free CC0 libraries, optimized with gltf-transform (Draco/Meshopt, KTX2) |
| Video | Compressed MP4/WebM used as video textures inside the scene |
| Content | Lightweight CMS or structured content files, so projects update without touching the 3D code |
| Hosting | Vercel |

**Performance and UX rules**

- A branded preloader shows progress; the opening starts within about 3 seconds on a normal connection.
- "View work directly" is always one tap away, opening a clean 2D reading view.
- Rooms stream in the background as the camera approaches; no loading screens between sections.
- Frame rate is monitored live and quality adapts to keep motion smooth.
- Mobile runs a lighter version of the same 3D world, moved by swipe.
- Keyboard navigation, reduced-motion mode (camera cuts instead of glides) and readable text fallbacks throughout.
- Every animation must have a purpose; nothing moves just because it can.

## Phased build roadmap

The site ships in four phases, and each phase starts only when the gate before it is passed. The 3D world is designed alongside the content from day one, and the link goes into applications and pitches at launch.

**Roadmap (content comes first, then the 3D world, then polish):**

| Phase | Work | Gate to next phase |
| --- | --- | --- |
| 1. Content + look | Pick 3-4 case studies, verify every metric, collect best Reels, 3D moodboard and layout | Content and look approved |
| 2. Build the world | Build world in code, lighting + materials, camera paths, every room wired, work on the screens | Every room works end to end |
| 3. Polish + launch | Tune camera easing, test on real devices, lighter mobile world, launch | Smooth on laptop and phone |
| 4. Grow | More case studies, add rooms over time, track which rooms lead to DMs | — |

The polish phase is where the smoothness is won: test on real laptops and phones, tune camera easing, and cut anything that drops frames.

## Building it in Antigravity

Google Antigravity's agents will write, run and test the code, but the smoothness comes from how tightly they are directed: build one piece at a time, check each in the browser, and hold every step to the performance budget.

### What Antigravity will and won't do

| Antigravity handles | Jay handles (no specialist needed) |
| --- | --- |
| Building the entire 3D world in code: architecture, screens, panels, monoliths, cards, floor reflections, light beams | Choosing the look: approving what feels premium |
| Lighting, materials and effects, set up in code | Real case studies, metrics and Reels |
| Finding, compressing and placing the few small props | Opening the preview link on his own phone and friends' phones |
| Camera paths, transitions, interactions, DM form | Saying "this feels laggy here" so the agent can fix it |

**No 3D artist is needed.** The Lab is mostly architecture and screens: walls, a reflective floor, glass panels, glowing vertical screens, monoliths and cards. These are simple shapes that look premium through materials, lighting and reflections, all of which the agent builds directly in code. The handful of real-world props (phone, tripod, ring light, camera) come from free CC0 libraries such as Poly Haven, or from an AI 3D generator, and the agent compresses them automatically. If a prop can't be found at the right quality, it is replaced with a clean abstract object instead.

**Phone testing is simple.** Every build gets a preview link on Vercel. Jay opens it on his own phone and asks two or three friends with different phones (ideally one older Android) to do the same and report any stutter.

### Set-up before the first prompt

1. Export this proposal as Markdown and save it in the project as `PROPOSAL.md`, so every agent reads the same brief.
2. Add a project rule telling agents to follow `PROPOSAL.md`, especially "The 3D world" and "Zero-lag performance budget".
3. Use Git and commit after every step, so any change that adds lag can be rolled back instantly.
4. Give each agent one task at a time. Big "build the whole site" prompts produce heavy, laggy code.

### Prompt kit (run in order)

**1. Project foundation**

```text
Read PROPOSAL.md. Set up a Next.js + TypeScript project with React Three Fiber, Drei, GSAP (ScrollTrigger), Lenis and React Postprocessing. Create one persistent full-screen 3D canvas that stays mounted across the whole site. Add an FPS monitor visible in development only. Do not build any rooms yet.
```

**2. World shell and camera**

```text
Build the Lab as a dark architectural studio entirely in code, with no external models: polished reflective floor, tall walls, soft light beams. Create a camera system that glides along a CatmullRom spline path between named stops (opening, hub, case-files, retention, range, strategy, report, about, dm). Drive it with Lenis smooth scroll and GSAP easing. Motion must hold 60fps; no layout-based animation.
```

**3. Opening sequence**

```text
Build the opening from PROPOSAL.md: vertical video screens appear one by one in darkness, freeze on "STOP.", show "YOU DID." and "That's the job.", then the camera pulls back into the Lab. Add a visible Skip button from the first frame, play it once per visitor, and show a still version in reduced-motion mode.
```

**4. One room at a time (repeat per room)**

```text
Build the [ROOM NAME] exactly as described in the "Room by room" table in PROPOSAL.md. Use instancing for repeated objects, video textures that play only when visible, and preload this room's assets before the camera arrives. Content comes from /content, not hard-coded. Open it in the browser, fly the camera in and out, and report the lowest FPS you measured.
```

Suggested order: Profile hub, Case Files, Retention Theatre, Range Wall, Strategy Room, Report Room, Results Wall, About + Services, DM exit.

**5. Performance pass**

```text
Audit the whole site against the "Zero-lag performance budget" in PROPOSAL.md. Measure frame time, draw calls, triangles and texture memory per room. Precompile all shaders at load, compress models with Draco/Meshopt and textures to KTX2, pause off-screen rooms, and add adaptive quality that lowers resolution before frames drop. List every budget item as pass or fail.
```

**6. Mobile, accessibility and 2D view**

```text
Create the lighter mobile world from PROPOSAL.md: fewer objects, smaller textures, swipe-driven camera. Add keyboard navigation, reduced-motion mode (camera cuts instead of glides), and a clean 2D "View work directly" reading view that uses the same content files.
```

**7. Props and launch**

```text
Find free CC0 models for these props: smartphone, phone tripod, ring light, camera, notebook. Check each licence allows commercial use. Optimize each with gltf-transform (Draco or Meshopt geometry, KTX2 textures, under 1 MB each) and place them in the About + Services corner. Re-run the performance audit, fix anything that fails, then prepare the site for deployment on Vercel with a preview link for phone testing.
```

### Checking smoothness at every step

- After each prompt, look at the FPS monitor while flying through every room in the built-in browser.
- Ask the agent to record a Chrome Performance profile of each camera path and point out any frame over 16.7 ms.
- If a step adds lag, reject it and ask the agent to fix the cause before moving on; never stack new rooms on top of a laggy one.

## Content checklist and final direction

The site is only as strong as the work inside it, so content is gathered before any design starts.

- [ ] 3–4 case studies across different niches, with client permission or anonymized
- [ ] Verified metrics with native-insight screenshots for each case study
- [ ] 6–10 of Jay's best Reels in high quality, including 2 with retention data for the Retention Theatre
- [ ] Sample captions and carousels for each brand voice on the Range Wall
- [ ] One anonymized monthly client report
- [ ] A short About story and working philosophy
- [ ] Services list, CV, and preferred contact inbox

| Decision | Final direction |
| --- | --- |
| Title | The Attention Lab |
| Positioning | Instagram-first Social Media Manager who creates attention and runs it at scale |
| Hero | I make people stop scrolling. |
| Design language | Premium dark editorial, restrained Instagram DNA, cinematic motion |
| Primary proof | Real work, Retention Theatre, Range Wall, verified results |
| Primary conversion | DM-style enquiry with Hiring and Project paths |

**The principle:** don't build a portfolio that looks like social media. Build one that behaves like great social media, and back every second of it with proof.


## Content folder

All real content lives in `/content` (profile.json, services.json, range-wall.json, results.json, reels.json, retention.json, case-studies/*.md, media/). Read from there; never hard-code content. Anything marked TODO is not yet provided and must not be invented.
