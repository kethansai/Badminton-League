---
name: "ABPL Public: Courtside Cinema"
description: "The shipped public visual system: photographic courts, an original dimensional shuttle, condensed headings, and editable arena colors."
colors:
  navy-950: "#060e15"
  navy-900: "#0c1a24"
  navy-800: "#16283a"
  gold-500: "#b8913a"
  gold-400: "#d4af61"
  gold-300: "#e6cc93"
  maroon-600: "#4a1e23"
  cream-100: "#ede6de"
  cream-050: "#f7f3ec"
  surface: "color-mix(in srgb, #060e15 72%, #101112)"
  surface-raised: "color-mix(in srgb, #16283a 44%, #151819)"
  line: "color-mix(in srgb, #ede6de 18%, transparent)"
  muted: "color-mix(in srgb, #ede6de 76%, color-mix(in srgb, #060e15 72%, #101112))"
  cta-surface: "color-mix(in srgb, #4a1e23 25%, color-mix(in srgb, #060e15 72%, #101112))"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontSize: "5.25rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0"
  display-interior:
    fontFamily: "Anton, sans-serif"
    fontSize: "5.5rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0"
  headline:
    fontFamily: "Anton, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0"
  title:
    fontFamily: "Anton, sans-serif"
    fontSize: "1.8rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0"
  story-title:
    fontFamily: "Anton, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0"
  member-title:
    fontFamily: "Anton, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  story-body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  lede:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  quote:
    fontFamily: "Barlow, sans-serif"
    fontSize: "2.45rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0"
  navigation:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0"
  button:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0"
rounded:
  square: "0"
  utility: "2px"
  circle: "50%"
spacing:
  control-gap: "1rem"
  content-inset: "1.5rem"
  card-gap: "2rem"
  compact-split-gap: "2.5rem"
  story-stack-gap: "3rem"
  section-compact: "4rem"
  story-row-gap: "5rem"
  section-wide: "6rem"
  edge: "clamp(1.25rem, 4vw, 3rem)"
components:
  button-primary:
    backgroundColor: "{colors.gold-400}"
    textColor: "{colors.navy-950}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "0.85rem 1.35rem"
  button-primary-hover:
    backgroundColor: "{colors.gold-300}"
    textColor: "{colors.navy-950}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
  scroll-link:
    backgroundColor: "transparent"
    textColor: "{colors.cream-100}"
    rounded: "{rounded.circle}"
    size: "46px"
  scene-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.cream-100}"
    rounded: "{rounded.circle}"
    size: "44px"
  navigation:
    backgroundColor: "transparent"
    textColor: "{colors.cream-100}"
    typography: "{typography.navigation}"
  story-status:
    backgroundColor: "transparent"
    textColor: "{colors.gold-300}"
    rounded: "{rounded.square}"
    padding: "0 0 0.2rem"
  fact-list:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.square}"
    padding: "1.8rem 0"
  member-placeholder:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.cream-050}"
    typography: "{typography.member-title}"
    rounded: "{rounded.square}"
  asset-credits:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    padding: "0 0 1.5rem"
---

# Design System: ABPL Public

## Overview

**Creative North Star: "Courtside Cinema"**

ABPL's public world places a recognizable badminton court and an original dimensional shuttle behind an immediately readable league identity. Near-black arena surfaces, chalk and cream text, a retained gold accent, and natural photographic color give the experience its character. Condensed uppercase headings sit beside plain reading text and native navigation.

Depth belongs to the sport: full-width photographs, a lit sixteen-feather shuttle, bounded scroll movement, and restrained tonal layers. Home uses asymmetric photographic stories; the inner pages use quieter lists, open sections, and compact real-record placeholders. Keep the existing ABPL name and crest, editable content, routes, and contact actions. The authenticated admin remains a separate task-focused visual system.

**Key Characteristics:**
- Full-width photographic scenes with unobstructed text and controls.
- Editable gold accents and chalk/cream type over near-black arena surfaces.
- Self-hosted Anton, Barlow, and Barlow Condensed at the shipped weights.
- Square content edges, circular scene controls, and quiet dividing rules.
- Bounded motion with a static, readable fallback and visible image attribution.

### Scope and authority

This is a post-build record, dated 2026-11-10, for the public wrapper on Home, About, Team, League, Stats, and Not Found. It does not restyle `/admin` or `/admin-login`, define their form components, or authorize content changes. [PRODUCT.md](PRODUCT.md) supplies durable constraints. The registered [surface brief](.impeccable/surfaces/frontend-src-views-homeview-vue.md) and [approval table](.impeccable/direction-options.json) establish Courtside Cinema, candidate 3, seed `e188e77a`, code-led. Proposed board swatches and first-viewport intentions are not substitutes for implemented values.

The controlling sources are the later public-scoped cascade in [frontend/src/assets/style.css](frontend/src/assets/style.css), the wrapper and theme binding in [frontend/src/App.vue](frontend/src/App.vue), and [frontend/src/stores/content.js](frontend/src/stores/content.js). Earlier declarations only count where they still win the cascade. See [frontend/README.md](frontend/README.md) for implementation ownership.

### Evidence and verification limits

The documentation pass inspected the current [desktop Home](.impeccable/review/desktop.png), [mobile Home](.impeccable/review/mobile.png), [tablet Home](.impeccable/review/tablet.png), and [mobile Team](.impeccable/review/team-mobile.png) captures against source. The supplied archive also includes [1121px Home](.impeccable/review/user-1121.png), [desktop About](.impeccable/review/about-desktop.png), [desktop League](.impeccable/review/league-desktop.png), and [mobile Stats](.impeccable/review/stats-mobile.png). Home viewport sizes supplied with the handoff are 1440x1000, 390x844, 820x900, and 1121x719 respectively; full-page image height is not viewport height.

The implementation handoff reports 45 passing frontend tests and prior browser checks for scene pixels, framing and clearance at four widths, pointer/scroll changes, reduced-motion cleanup, image loading, overflow, fallbacks, navigation, cards, and local font requests. Those are supplied verification results, not tests rerun by this documentation pass. The final fix-list verdict was **Pass, disposition ship**, specifically for four fixes: refined rounded/textured feathers with new model-derived posters; the larger compact shuttle (approximately 175px wide in the phone check, not a fixed CSS width); visible Home photo context; and self-hosted fonts. It is not a blanket whole-site aesthetic, accessibility, or runtime certification. No full Lighthouse or accessibility certification is claimed.

Not canonized or repaired: the compact Home photo disclosure reaches 0.64rem, a small-text legibility risk rather than a reusable type role; the pre-content error branch retains inherited styling outside the public wrapper, and the loading ticker retains inherited maroon. Dormant eyebrow, gradient-card, shield, and mesh rules are not the public system. Existing Vite/source-map-js advisories remain outside this documentation handoff.

## Colors

The palette is a gold-accented, cream-on-arena UI surrounded by the actual court colors in photographs; it is not a monochrome blue theme or a cream page background.

### Primary

- **Retained Gold** (`gold-400`): primary action fill, current navigation, focus, selection, and crest accent.
- **Rule Gold** (`gold-500`): fine status underlines, list counters, and inherited supporting details.
- **Light Gold** (`gold-300`): the primary fill-reveal state, status text, and link/icon emphasis.

### Secondary

- **Maroon Undertone** (`maroon-600`): an input to the subdued contact band's `cta-surface`, not a second high-emphasis action color. A solid inherited use remains in the loading ticker only.

### Neutral

- **Arena Ground** (`surface`): public page ground, inner sections, footer, and compact navigation.
- **Raised Arena** (`surface-raised`): member faces and image loading grounds, not a default wrapper for every section.
- **Chalk** (`cream-050`): headings and primary public foreground.
- **Warm Reading White** (`cream-100`): paragraphs, navigation, and scene icons.
- **Muted Reading White** (`muted`): stories, facts, footer links, and photo context.
- **Quiet Rule** (`line`): low-emphasis dividers and component strokes; it is translucent, not an opaque gray.
- **Inherited Dark Inputs** (`navy-950`, `navy-900`, `navy-800`): foundations for mixed surfaces, dark button ink, skeletons, and the biography return control. They are not three interchangeable public panel levels.

### Editable mapping

Frontmatter colors are the stylesheet/seed defaults, not a readback of the live database. Mixed colors preserve the source `color-mix()` operations with default inputs resolved so primitives stand alone. At runtime, the store maps appearance keys such as `gold400` to `--gold-400` on the public wrapper. The mix recipes continue to use those live variables: ground uses 72% darkest navy, raised ground uses 44% navy-800, rules use 18% cream-100, muted ink uses 76% cream-100, and the contact band uses 25% maroon-600. Do not replace these recipes or saved choices with documentation snapshots.

[backend/src/seed.json](backend/src/seed.json) initializes content; it must not overwrite published appearance. The unused `navy700` and overridden public uses of `maroon500` remain editable data, but do not earn new visible palette roles here. The sidecar's eight-step OKLCH ramps are synthesized panel swatch previews only, not additional shipped theme tokens.

**The Live Accent Rule.** Resolve public colors through the saved appearance variables; the photographed court supplies additional color without becoming a second UI palette.

## Typography

**Display Font:** Anton, with the configured generic sans-serif fallback.
**Body Font:** Barlow, with the configured generic sans-serif fallback.
**Utility Font:** Barlow Condensed for the wordmark and primary navigation.

The compressed display voice is inherited ABPL identity, now self-hosted rather than replaced. [frontend/src/main.js](frontend/src/main.js) imports exactly eight Latin faces: Anton 400; Barlow 400, 500, 600, 700; Barlow Condensed 500, 600, 700. No runtime Google Fonts request is required. CSS has additional system fallbacks before content loads; those are not the intended display voice. Saved font settings remain effective through the store. A newly selected family is not automatically downloaded by this implementation.

### Hierarchy

Use the frontmatter roles for wide-screen values. This is an observed hierarchy, not a mathematical modular scale. Headings are uppercase and weight 400; body text uses the regular face, with selective medium/semibold functional text. Letter spacing is zero throughout. Font sizes step at breakpoints rather than scaling with viewport width; the fluid value in `spacing.edge` is padding, not type.

| Role | Actual use | Responsive change |
| --- | --- | --- |
| `display` | Home title | 4.25rem at 1200px and below; 3rem at 960px and below; 2.6rem at 380px and below |
| `display-interior` | Other public hero titles | 5rem at 1200px and below; then the same compact title sizes |
| `headline` | Section headings | 2.5rem at 960px and below |
| `title` | List and franchise headings | Retains the role size; member titles use `member-title` |
| `story-title` | Home editorial story headings | 2.4rem at 960px and below |
| `body` | Default reading text | Remains 18px; component-specific text overrides it |
| `story-body` | Home story copy | 1rem at 960px and below; measure up to 46ch |
| `lede` | Hero introduction and tagline | 1rem at 960px and below; up to 34ch compact, 48ch wide intro, 44ch wide tagline |
| `quote` | About and League quoted narrative | 1.7rem at 960px and below; up to 32ch |
| `navigation` | Functional uppercase links | Same type role; switches to a vertical menu |
| `button` | Public action links | Sentence case, not inherited uppercase utility styling |

The contact heading has its own observed size, 3.6rem wide and 2.8rem compact, with an 18ch measure. Fact descriptions reach 72ch; mission/vision body copy reaches 56ch. Do not impose one universal paragraph measure on these different reading contexts. Later 960px rules win over earlier 3.8rem/4.4rem hero declarations and the earlier 2.3rem story title.

**The Condensed Headline Rule.** Use the configured display face for uppercase headings and the body face for reading; keep functional navigation in the utility face.

## Layout

The public container is 1440px maximum including edge padding, centered in full-width bands. `spacing.edge` supplies the horizontal gutter. Section spacing is generous but content groups remain tighter; the named spacing entries record reused roles, not an invented uniform grid unit.

| Width condition | Active layout change |
| --- | --- |
| Above 1200px | Full wide title sizes and twelve-column Home story arrangement |
| 1200px and below | Smaller wide hero titles; the first story's internal gap becomes 2.5rem |
| 960px and below | Compact hero/shuttle composition, menu, single-column Home stories and split narratives, smaller headings, four-rem section spacing, two-column footer links |
| 860px and below | Generic three-column member/franchise grid becomes one column; member cards cap at 600px |
| 380px and below | Smallest hero title, smaller wordmark/crest, and single-column footer |

Legacy 800px, 760px, and 600px rules are not independent breakpoints for the replaced public split, footer, or section/title system: later, more specific public rules win. Other unchanged legacy component declarations still apply where not overridden.

Home's first story spans all twelve tracks, splitting image and copy at 1.65:1. Subsequent placements follow a seven/five-column rhythm, with the five-column story offset by 7rem. The grid gaps are 5rem vertically and 2.5rem horizontally. Image ratios are 1.45 by default, 1.25 on seven-column stories, and 1.15 on five-column stories; all become 1.3 in the compact layout. This is Home's story grammar, not a requirement to make every inner page asymmetric.

The wide Home hero uses `min-height: min(740px, calc(100svh - 220px))`; the compact rule uses `max(620px, calc(100svh - 210px))`. These are minimum heights, not hard clipping dimensions. The opening leaves room for the announcement strip and a meaningful next-section preview in the supplied captures. Hero text and action locations, not a fixed shuttle image width, determine the compact free band. Inner heroes use a 420px minimum wide and 380px compact. The header overlays the photograph absolutely, not as the old sticky navigation; its minimum height is 82px wide and 76px compact.

The broad editorial photograph on About uses a 2.8 ratio, then 1.4 compact. The footer uses 2:1:1 tracks, two link columns with a full-width brand at 960px, and one column at 380px. Contact bands are open horizontal compositions that stack on compact screens. No section needs a floating card merely to group its content.

## Elevation & Depth

Depth is photographic and object-led rather than a stack of elevated interface panels. The Home court uses reduced opacity and directional/floor-fade overlays for text clearance; compact layouts use a vertical shade and repositioned photograph. These gradients are native compositing tools in this world, not a gradient-only hero. The Three.js shuttle uses directional lighting, self-shadowing, curved feathers, and procedural barb/ridge texture. General public cards have transparent grounds and quiet top rules; member cards retain a raised tonal ground.

### Shadow vocabulary

The member interaction uses a layered `0 1px 2px / 0 8px 16px / 0 24px 48px` black shadow and a 16px `translateZ` lift when tilting or focused, not a resting page-panel shadow. Front-face glare and a pointer-tracked gold border glow are state effects. Public franchise cards keep their quiet top rule at rest; on pointer hover they raise a `--surface-raised` plate (extending 1.25rem past the text) with a matching layered shadow and a gold light that follows the pointer along the top rule. Do not describe the entire system as shadow-free, and do not broaden these effects to every section.

**The Scene-First Depth Rule.** Let photography, the lit shuttle and quiet tonal layers carry depth; reserve card shadows, glare and border glow for member and franchise hover states.

### Motion grammar

The exact extension values are recorded in [.impeccable/design.json](.impeccable/design.json). The CSS ease-out is `cubic-bezier(0.16, 1, 0.3, 1)` and the press/icon spring is `cubic-bezier(0.34, 1.56, 0.64, 1)`. UI transitions are short: primary fill reveal 280ms, circular-control radial fill 400ms, navigation underline 250ms. Buttons press to 0.96, circular controls to 0.92, member cards to 0.985, each releasing on the spring. Reveal moves 18px over 420ms, triggered at 20% visibility with a 60ms sibling step capped at 240ms; Home story photographs and the About editorial photograph additionally unclip upward over 1.1s. Keyboard focus can reveal content immediately.

Route changes use a surface-coloured curtain with gold leading and trailing rules ([frontend/src/App.vue](frontend/src/App.vue)): it covers in 280ms while the outgoing page fades, the router scroll reset waits for full cover ([frontend/src/routeScroll.js](frontend/src/routeScroll.js)), then it exits upward over 500ms while the new page fades in from 12px and 0.985 scale over 420ms. Reduced or disabled motion skips the curtain entirely. On load the hero photograph settles from 1.06 scale and transparent over 1.4s, headline words follow, the copy at 320ms, actions at 440ms, and the baseline/attribution at 600ms.

The first visit opens on a boot loader written into [frontend/index.html](frontend/index.html) so it paints before any script: an outlined shuttlecock with a gold cork turns over every 1.6s inside a counter-rotating gold orbit, above "Loading the court" and a 168px progress rule. [frontend/src/bootLoader.js](frontend/src/bootLoader.js) advances the rule only on real milestones (published content, fonts and page assets, then the WebGL shuttle and hero photograph, which take holds) and fades the loader over 550ms once all are settled, with a 12s failsafe and immediate release on content errors and admin routes. The app stays inert and the hero entrance animations stay paused (`html.is-booting`) until then, and the shuttle's introduction pose starts only after the loader has gone. Reduced motion keeps the loader static.

[frontend/src/composables/useScrollScenes.js](frontend/src/composables/useScrollScenes.js) adds scrubbed GSAP ScrollTrigger scenes, rebuilt in a fresh `gsap.context` after each route enters and reverted while one leaves: a 2px gold page-progress rule at the top of the viewport; hero copy fading to 0.12 opacity as the hero leaves; announcement groups skewing with scroll velocity (clamped to 9 degrees) and settling back over 600ms; Home story copy drifting from +56px to -28px against its photograph on wide layouts; the League crest turning one full revolution across its scroll range (replacing the hover tilt while motion is on); numbered league facts sliding in from -80% with opacity 0.2 to 1; and the closing call-to-action heading rising from 40% and 0.25 opacity, reaching full opacity before its banner passes mid-screen. None of these run for reduced motion or the site motion switch.

[frontend/src/components/AmbientField.vue](frontend/src/components/AmbientField.vue) draws two slowly orbiting gold/maroon light pools and up to 56 rising motes on a 2D canvas behind interior hero copy and the closing call to action. It renders at 30fps with device pixel ratio capped at 1.5, only while on screen in a visible tab, and is absent for reduced motion, the site motion switch, and forced colors. [frontend/src/directives/mediaReady.js](frontend/src/directives/mediaReady.js) covers still-loading story and editorial photographs with the skeleton shimmer, fading it out over 600ms once the image settles.

[frontend/src/composables/usePhotoParallax.js](frontend/src/composables/usePhotoParallax.js) scopes GSAP ScrollTrigger to Home story photos and the About editorial photograph: wide images travel from -3.5% to +3.5% at scale 1.12; the portrait travels from -0.8% to +0.8% at scale 1.035. Both use linear easing, `scrub: 0.6`, and the story's (or frame's) top-bottom to bottom-top scroll range. Cleanup reverts the context when hidden, disabled, or unmounted. The ordinary CSS image-hover scale remains a separate fallback treatment.

[frontend/src/components/PageHero.vue](frontend/src/components/PageHero.vue) clamps the hero offset to +/-30px on every page; the photograph uses 0.7 of that offset (1.08 scale on Home, 1.1 on interior heroes), while wide text uses -0.25 of the offset. Compact text has no parallax transform. [frontend/src/graphics/shuttle.js](frontend/src/graphics/shuttle.js) uses a 1.25s first introduction and 0.65s bounded pointer/scroll pose changes with `power3.out`; it does not run an idle spin. Photo parallax is not controlled by the local hero pause button, and the announcement strip has its own pause control.

[frontend/src/composables/usePointerEffects.js](frontend/src/composables/usePointerEffects.js) retains a visible native cursor plus a decorative 28px follower trailing on an 80ms exponential lag. It fills and inverts (difference blend, 1.6x) over links and buttons, and opens to a 2.2x ring over cards and story pieces. Magnetic offsets are bounded to 5px and also apply to the circular scroll and scene controls; card tilt is bounded to 4 degrees vertically and 5 horizontally and publishes `--pointer-x/--pointer-y` for border glow. These stop for coarse pointers, reduced motion, forced colors, hidden documents, and admin routes. [frontend/src/composables/useMediaQuery.js](frontend/src/composables/useMediaQuery.js) combines the OS preference with the site's motion switch; [frontend/src/composables/useViewportMotion.js](frontend/src/composables/useViewportMotion.js) also gates hero, quote and ambient-field work by visibility. Disabled motion keeps content readable and announcements wrapped into a static list.

## Shapes

Content surfaces, image crops, primary buttons, contact bands, and member faces use square edges. The circular exception is functional: the scroll link and scene toggle. The compact navigation toggle and skeleton bars retain the small `utility` radius. Borders are predominantly one-pixel quiet rules; missing portraits use a 64px square monogram frame. This is not a pill-navigation or rounded-card system, but neither are circles forbidden where the existing controls use them.

Icons come from the existing Lucide Vue library, with common action/scene sizes of 16-22px and 20px biography icons. Sidecar specimens inline the corresponding SVG shapes; glyph substitutes are not a system primitive. The feather silhouette is model geometry, not an approximation of a photographic subject with a mask.

## Components

### Buttons and scene controls

Primary actions are square gold links with dark ink, a 52px minimum height, the `button` type role, and the frontmatter padding. The light-gold hover/focus fill grows from the bottom. Arrow icons move 2px right and 2px up; active buttons scale to 0.96, and disabled buttons use 0.55 opacity and a not-allowed cursor. Global keyboard focus is a 2px gold outline with a 4px offset. The circular scroll and scene controls use the recorded sizes and a quiet one-pixel border; their hover background is translucent white. The scene and announcement pause controls have distinct accessible names and titles. Native links remain links.

### Navigation

[frontend/src/components/SiteHeader.vue](frontend/src/components/SiteHeader.vue) pairs the existing crest with the condensed two-line name. Wide links have a 44px minimum height, a gold active state, and a two-pixel underline revealed on hover/focus/current route. Compact navigation uses a 44px menu button, full-width rows, and no underline. Closed links are inert; Escape closes the menu and restores toggle focus. Route and breakpoint changes close it. Retain the skip link and main-content focus behavior. The admin has no public navigation entry.

### Stories, statuses, and lists

[frontend/src/views/HomeView.vue](frontend/src/views/HomeView.vue) uses open photographic articles, not equal promotional cards. Reference-photo context is content, not an invented eyebrow. Existing status text such as "Coming Soon" stays subordinate with a gold underline; it is not a button or filter chip. Inner sections keep descriptive labels below their headings. [frontend/src/components/FormatList.vue](frontend/src/components/FormatList.vue) supports numbered league facts and unnumbered season details, with 1.8rem block padding, a 2rem inner gap, and quiet separators except on the last item. Numbering is an existing list variant, not permission to decorate unrelated section headings with indices. Franchise records are open top-rule entries and remain placeholders until real data is published.

### Member cards

[frontend/src/components/TeamMemberCard.vue](frontend/src/components/TeamMemberCard.vue) renders the published name or role. Missing images yield initials from the first two alphanumeric words, not invented portraits. These compact cards have a 240px minimum height, a 64px monogram frame, and 2.2rem initials. Real image variants retain a 250px image region and a 400px minimum card height. Front-body padding is 1.5rem, with 3.5rem reserved below for the control; the placeholder body starts at 1rem. The front-state panel specimen uses the real seed role "Founder & League Commissioner", not an announced person.

The native biography button owns the flip, label, expanded state, and Escape recovery. Hidden faces are inert and aria-hidden. The existing flip lasts 600ms, with 200ms front-face tilt response. The return control is 44px. Do not make a decorative card hover the only way to read a biography; the sidecar front-state specimen does not implement the Vue flip controller.

### Court and shuttle

[frontend/src/components/ShuttleScene.vue](frontend/src/components/ShuttleScene.vue) lazy-loads the original Three.js scene on Home only. Sixteen curved feathers, shafts, two stitching rings, a leather-covered base, and a gold band form the model. The canvas is decorative, pointer-transparent, and hidden from assistive technology; the hero surface receives bounded pointer input. Pixel ratio is capped at 1.5. At 960px and below the scene changes to a horizontal pose fitted to measured text/action bounds with 16px clearance and additional model-bounds safety. The desktop pose occupies the right foreground.

When WebGL is unavailable, loading fails, or the context is lost, the component exposes the matching raster fallback. The desktop poster is 704x677 and the compact poster is 655x493; both come from the same model, with the compact source selected at 960px. Reduced motion keeps a static render when WebGL works; it does not necessarily force a poster. Settled, paused, offscreen, or hidden scenes stop ongoing animation work; disposal releases geometry, materials, textures, and the renderer. Controls and content never depend on WebGL.

### Footer and asset context

[frontend/src/components/SiteFooter.vue](frontend/src/components/SiteFooter.vue) retains native route/contact links and displays unconfigured social destinations as non-interactive text. A visible statement identifies the imagery as reference badminton, not ABPL events or participants. Native expandable asset credits link the photograph sources, licenses, and three local font notices; visible disclosures also accompany the hero and story photographs.

[frontend/src/assets/README.md](frontend/src/assets/README.md) records the six shipping rasters: the existing crest; court photography by Darakshanehaluddin under CC0 1.0; Wilson Dias / ABr's doubles photograph under CC BY 2.5; the Peter Gade photograph with permission attributed to Manuel Roesler under CC BY 2.0; and two original model-rendered posters. The handoff reports embedded provenance on all six. This pass checked the origin/license record and rendered use, not a new binary-metadata or rights audit. Keep the documented resizing, cropping, and color-treatment disclosure. Study images from the cinematic references are not shipping artwork.

### Loading, recovery, and specimen limits

[frontend/src/components/SiteSkeleton.vue](frontend/src/components/SiteSkeleton.vue) mirrors the header, hero, and route-specific story/grid structure, announces loading once, and hides decorative placeholders from assistive technology. Its 1.6s shimmer pauses in hidden tabs and is disabled by reduced motion. Refreshes retain available published content. The API failure branch offers a real retry; it is outside the public wrapper and is not the canonical public button/layout sample. Empty states come from the editable page records.

The sidecar contains eight self-contained HTML/CSS specimens: primary action, scroll link, scene toggle, navigation, status, fact list, member front face, and asset credits. It intentionally defines no public input system; the actual forms belong to admin. CSS variable fallbacks reproduce default appearance outside the public wrapper; a host must load the local fonts for exact glyphs. Native link/details behavior works without Vue, but menu, pause, and biography actions still require their source controllers. Synthesized ramps and preview-only backing surfaces are documentation aids, not newly approved product components.

## Do's and Don'ts

### Do:
- Do preserve ABPL's name, crest, published content, native routes, and the separate task-focused admin.
- Do resolve colors and fonts through the existing appearance variables and keep unknown people, cities, and results explicitly unannounced.
- Do keep text, navigation, controls, and photo disclosure clear of the shuttle at each responsive composition.
- Do retain real badminton imagery, source/license links, and same-model desktop/compact fallbacks.
- Do keep motion bounded, optional, visibility-aware, and disposable without hiding content or keyboard actions.

### Don't:
- Don't carry overridden legacy cards, decorative hero mesh, or unused palette values into new public surfaces as visible precedent.
- Don't turn Home's photographic sequence into equal feature cards or frame the full-width scene inside a decorative panel.
- Don't invent heading kickers, people, events, or endorsements; a real source disclosure or published status is not a decorative label.
- Don't ban all gradients, shadows, or circles: the shipped world uses photographic shading, member interaction depth, and circular controls deliberately.
- Don't treat the four-fix ship verdict, documentation specimens, or synthesized swatch ramps as whole-site certification or a new runtime source of truth.