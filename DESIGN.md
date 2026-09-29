---
name: FieldSeal
description: A field-instrument workspace for recording and inspecting evidence.
colors:
  "primary": "#087f8c"
  "primary-hover": "#076774"
  "focus": "#20a9b7"
  "link": "#086f92"
  "navy-rail": "#102940"
  "nav-hover": "#203e57"
  "nav-active": "#14536c"
  "nav-text": "#dce8f1"
  "rail-muted": "#b5c9d9"
  "ink": "#112942"
  "muted": "#53687d"
  "surface": "#fff"
  "surface-soft": "#f8fafc"
  "summary-surface": "#f7f9fb"
  "border": "#d5e1ec"
  "divider": "#e0e7ee"
  "secondary-text": "#183a52"
  "secondary-border": "#9eb2c3"
  "secondary-hover": "#f0f5f8"
  "input-border": "#afbfcc"
  "input-text": "#19364d"
  "label-text": "#2b4258"
  "status-teal-bg": "#d5eef0"
  "status-teal-text": "#065d65"
  "status-amber-bg": "#fff0cc"
  "status-amber-text": "#765015"
  "status-neutral-bg": "#e9edf3"
  "status-neutral-text": "#3e526a"
  "alert-bg": "#fff3d8"
  "alert-border": "#ead09a"
  "alert-text": "#74501c"
  "danger-bg": "#fff0ef"
  "danger-border": "#e5b8b4"
  "danger-text": "#9b342c"
  "verified-bg": "#e0f2ea"
  "verified-text": "#146249"
  "invalid-bg": "#fdebea"
  "invalid-text": "#9d332b"
typography:
  display:
    fontFamily: "Mina, \"Segoe UI\", sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  display-wide:
    fontFamily: "Mina, \"Segoe UI\", sans-serif"
    fontSize: "52px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  dossier:
    fontFamily: "Mina, \"Segoe UI\", sans-serif"
    fontSize: "clamp(29px, 3vw, 42px)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "\"Segoe UI\", Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "\"Segoe UI\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  body-wide:
    fontFamily: "\"Segoe UI\", Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "\"Segoe UI\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.55
  badge:
    fontFamily: "\"Segoe UI\", Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  "field": "5px"
  "control": "6px"
  "panel": "7px"
  "circle": "50%"
spacing:
  "7": "7px"
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "14": "14px"
  "15": "15px"
  "16": "16px"
  "17": "17px"
  "18": "18px"
  "20": "20px"
  "22": "22px"
  "24": "24px"
  "25": "25px"
  "30": "30px"
  "32": "32px"
  "34": "34px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 21px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.link}"
    padding: "0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.input-text}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    width: "100%"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.nav-text}"
    rounded: "{rounded.control}"
    padding: "15px 16px"
  nav-item-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.surface}"
  badge-amber:
    backgroundColor: "{colors.status-amber-bg}"
    textColor: "{colors.status-amber-text}"
    rounded: "{rounded.panel}"
    padding: "5px 8px"
    typography: "{typography.badge}"
  badge-teal:
    backgroundColor: "{colors.status-teal-bg}"
    textColor: "{colors.status-teal-text}"
    rounded: "{rounded.panel}"
    padding: "5px 8px"
    typography: "{typography.badge}"
  badge-neutral:
    backgroundColor: "{colors.status-neutral-bg}"
    textColor: "{colors.status-neutral-text}"
    rounded: "{rounded.panel}"
    padding: "5px 8px"
    typography: "{typography.badge}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  alert:
    backgroundColor: "{colors.alert-bg}"
    textColor: "{colors.alert-text}"
    rounded: "{rounded.control}"
    padding: "15px 17px"
  section-switcher:
    backgroundColor: "transparent"
    padding: "19px 0"
---

# Design System: FieldSeal

## Overview

**Creative North Star: "The Field-Instrument Workspace"**

The field-instrument workspace keeps one recording task in focus and makes evidence state inspectable. White working surfaces, a deep navy rail and restrained teal actions establish a calm, practical hierarchy. Mina headings give the workspace a recognizable voice while Segoe UI carries dense records, forms and guidance.

The approved direction uses crisp flat geometry, stable alignment and explicit status. Synthetic examples remain visibly labelled; the interface does not imply an agency identity or validated substance recognition. Dashboard, capture and evidence views share this system.

**Key Characteristics:**

- A stable navy rail and white work surfaces.
- Teal actions, amber uncertainty and explicit status text.
- Mina page headings above compact workhorse typography.
- Flat bordered panels and precise synthetic calibration geometry.

This document records the implemented visual system from `frontend/src/style.css`, `App.tsx`, `Features.tsx`, `SampleCard.tsx` and `main.tsx`. Frontmatter tokens preserve built values; the application currently uses literal CSS rather than custom properties.

## Colors

The palette combines a deep blue structural rail, cool neutral work surfaces and restrained teal action colour. Frontmatter owns exact values; semantic names below explain their use.

### Primary

- **Instrument Teal** (`primary`, `primary-hover`): primary actions, active capture steps and recurring operational accents.
- **Focus Teal** (`focus`): the keyboard focus outline, distinct from filled action colour.
- **Record Link Blue** (`link`): record identifiers and text actions.

### Secondary

- **Amber Caution** (`status-amber-*`, `alert-*`): inconclusive readings and corrective guidance.
- **Verification Green** (`verified-*`): the implemented integrity-success panel, always accompanied by its precise meaning.
- **Error Red** (`danger-*`, `invalid-*`): errors and failed integrity checks; never a decorative accent.

### Neutral

- **Deep Navy Rail** (`navy-rail`): persistent navigation; `nav-hover` and `nav-active` distinguish interaction and location.
- **Ink / Muted Ink** (`ink`, `muted`): primary text and explanatory copy.
- **White Work Surface** (`surface`): the main canvas, panels and fields.
- **Cool Paper** (`surface-soft`, `summary-surface`): table heads, top bar and summary band.
- **Fine Structure** (`border`, `divider`, `input-border`): boundaries without ambient shadows.
- **Neutral Status** (`status-neutral-*`): outcomes outside the explicit teal and amber mapping.

**The State Has Words Rule.** Pair semantic colour with a visible outcome or instruction; an inconclusive reading must remain understandable without colour.


## Typography

**Display Font:** Mina, then Segoe UI and sans-serif. The application imports the local package's 700 weight.

**Body Font:** Segoe UI, then Arial and sans-serif. Code values use the browser monospace family; there is no custom mono family.

Mina gives large headings an individual, compact silhouette. Segoe UI keeps operational copy familiar and legible. The sizes form a practical hierarchy, not a declared modular ratio.

### Hierarchy

- **Display:** base H1 uses `display`; at widths at least 1200px it uses `display-wide`. At 1150px and below it is 34px, and at 700px and below 29px.
- **Evidence heading:** `dossier` scales with viewport width, wraps long identifiers and reduces to 23px at 480px and below. Its more specific rule supersedes general H1 sizing.
- **Headline:** `headline` sets panel headings; these reduce to 17px at 700px and below. Third-level headings are 16px. Result headings use 27px.
- **Body:** `body` becomes `body-wide` from 1200px. Guidance uses 14px with 1.8 line-height; section introduction copy is limited to 70ch.
- **Label:** `label` supports form labels. Table headings are 12px and weight 600; table numbers use tabular figures. Badges use `badge`, increasing to 12px from 1200px.

**The Heading Has a Job Rule.** Use Mina for page and evidence-record headings; keep form labels, tables and supporting information in Segoe UI.

## Layout

The fixed left rail is 236px wide; the workspace uses an equal left margin. The top bar is 64px high and the main content has 32px padding. At 1500px and above the rail grows to 250px and main padding to 34px. At 1150px and below these become 210px and 25px.

The dashboard's primary/secondary grid is 1.7fr / minmax(280px, 1fr), with a 22px gap. At 1150px and below it becomes 1.5fr / minmax(250px, 1fr). At 950px and below the main grid stacks while secondary cards use two columns; those also stack at 700px.

Capture and evidence use a 2fr / minmax(270px, 1fr) working grid with a 24px gap. At 1050px and below it becomes 1.6fr / minmax(230px, 1fr); at 800px it stacks. Within the evidence reading, imagery and metadata use 1.1fr / minmax(230px, 1fr) and a 24px gap; they stack at 1100px and below. Metadata columns are 90px / 1fr in the wide reading and 110px / 1fr after stacking.

Forms use two equal columns with 20px gaps, reducing to 17px at 800px and one column at 480px. Padded panel interiors step from 25px to 20px at 1050px and 18px at 480px. The extracted spacing values describe the incumbent implementation; there is no invented base-unit scale.

At 700px and below the rail becomes a 230px drawer beneath a 58px top bar. Closed navigation is hidden. The workspace loses its left margin; main padding becomes 22px 16px. Page actions wrap below headings. Tables retain a 540px minimum width inside a horizontal scroll container. Section switchers scroll horizontally at 480px; hashes and record identifiers wrap.

## Elevation & Depth

The system is flat: thin borders, cool background tones and whitespace establish depth. Panels, inputs and primary buttons have no box shadow at rest or on hover.

### Shadow Vocabulary

- **Mobile rail:** `10px 0 30px #10294030`, applied only to the open rail at 700px and below.
- **Custody marker outline:** `0 0 0 1px #98bdc6`, a sharp ring around the timeline marker, not ambient elevation.

**The Flat Work Surface Rule.** Use borders and surface tone to separate working regions; reserve the existing cast shadow for the open mobile rail.

## Shapes

Controls and notices use `control` rounding; fields and remarks use `field`; bordered panels and badges use `panel`. Circular avatars, step numbers, quality indicators and timeline markers use true circles. Borders are thin and explicit. Avoid expanding these gently rounded rectangles into oversized pills.

The calibration reference is exact vector geometry: a 660 by 360 viewBox; a white card at (75,55), 510 by 250 with radius 8; ten 37 by 35 chips at y=149, starting at x=102 with 45px spacing; and a response well at (125,263) with radius 20. Preserve alignment guides, wording, ordering and scenario treatment from `SampleCard.tsx`. These SVG-specific colours are illustration detail, not global interface accents.

## Components

### Buttons

Confident, compact and explicit. Primary buttons use the primary fill, white text, `control` radius, 12px 21px padding, weight 600 and a 44px minimum height. At 700px and below padding becomes 10px 16px. Secondary buttons use white, a fine secondary border, 10px 16px padding and a 42px minimum height. Link buttons use blue text, no fill or border, and underline on hover.

Background and colour transition over 0.15s with default CSS easing. All button variants share the 3px focus outline with 3px offset. Disabled buttons show 0.55 opacity and a not-allowed cursor. No pressed transform is implemented.

### Chips

Status badges are compact rounded rectangles with 5px 8px padding and 1.4 line-height. The mapping is explicit: Inconclusive is amber; Presumptive indication is teal; other values are neutral. Badges are informational, not interactive controls.

### Cards / Containers

White bordered containers with `panel` rounding and hidden overflow. Panel headers use 20px 19px padding, a divider and aligned title/action; at 700px this becomes 16px. Use the documented padded interior scale where content needs breathing room. Summary bands use a cool surface and internal separators rather than shadows.

### Inputs / Fields

White fields with a one-pixel input border, `field` rounding, 10px 12px padding and a 44px minimum height. Labels sit above with a 7px gap. Fields share the global focus outline and teal caret. Textareas resize vertically. The upload label receives the same outline through focus-within. Errors appear in explicit alert regions; there is no invented error-border field variant.

### Navigation

The navy rail has compact left-aligned icon/text buttons, 15px 16px padding and 8px vertical gaps. Hover changes the navy tone; the current location uses the active blue-teal fill and white text. Navigation to a screen or record resets scroll and focuses its H1; capture-step changes reset scroll and focus the step heading.

At 700px and below, a 66px navy header and a 72px bottom navigation bar frame the phone workspace. Home, Capture, Records and Verify connect to the same workflows as the desktop rail; More opens the remaining navigation with a dismissible scrim and Escape support. The navigation respects the bottom safe-area inset, marks the current page and remains clear of content through workspace padding. Phone evidence entries replace the wide records table with full-width buttons containing the record, case, outcome and capture time. Capture fields use 16px text, primary controls have a 48px minimum height, and compact quality indicators sit above the scenario selector. At 360px and below, metadata and capture-header actions stack. Interactive keyboard focus remains visible; programmatically focused screen headings omit the decorative outline on phones.

### Evidence section switchers

Reading, Chain of custody and Lab outcome are ordinary buttons in a labelled group with `aria-pressed`. The selected button uses teal text, bold weight and a 3px bottom rule. Do not document these as ARIA tabs: the implementation does not use a tablist or tab keyboard model.

### Capture stepper and custody timeline

The horizontal stepper uses numbered circles, a filled teal current step and a pale completed-step treatment. It marks the current step with `aria-current="step"`; future steps are disabled. At 800px circles reduce from 36px to 29px; at 480px labels sit below their circles. The custody timeline uses a fine vertical line and small teal circular markers to keep a readable event sequence.

### Synthetic calibration reference

Use the exact SVG reference in dashboard, capture and dossier contexts. The missing-card scenario replaces it with a clear message; low light adds the implemented dark overlay; the negative scenario changes only the response well. Retain the accessible synthetic-reference description and the visible DEMO ONLY label. Uploaded imagery is contained within its frame, with a 430px maximum height.

Motion remains limited to button state colour and the mobile drawer's 0.2s transform. Reduced-motion preference disables transitions and animations. The sidecar's HTML/CSS specimens represent visual states; they are not a replacement for React behaviour or API integration.

## Do's and Don'ts

### Phone presentation

The optional `?phone-preview` route places the live application in a 390 × 844 CSS-pixel device screen. Its illustrative status area and gesture bar surround the embedded application; they are not app controls or device telemetry. A dark rounded device edge and side buttons distinguish this presentation from a narrow desktop screenshot. The preview scales down on shorter windows and links back to the full workspace. Phone layouts hide desktop scrollbar chrome while retaining scrolling, use system-font screen headings, emphasize summary numbers, and retain the visible demo label. README captures are taken directly from this interactive preview.

### Do:

The additional `&screen-only` presentation removes the hardware edge, camera cutout, surrounding canvas and caption. Its rectangular screen fills the viewport, retaining the illustrative status and gesture areas. README screenshots use this mode at 390 × 844 and show capture, low-light review and completed integrity verification.

- Do preserve the navy rail, white working surfaces and restrained teal actions.
- Do keep synthetic reference labels and demonstration scope legible beside the work.
- Do preserve the calibration card’s SVG geometry and full reference-chip sequence.
- Do retain visible keyboard focus, semantic labels and reduced-motion behaviour.
- Do let long record identifiers and hashes wrap, and let compact tables scroll inside their container.
- Do present capture imagery and metadata side by side on wide evidence views and stack them at the implemented breakpoint.

### Don't:

- Don't introduce chat UI, glowing AI decoration or invented agency branding.
- Don't turn inconclusive outcomes into positive findings or rely on colour alone.
- Don't replace the synthetic reference with unlabelled pseudo-evidence imagery.
- Don't add decorative card shadows or oversized pill shapes to the flat instrument system.
- Don't interpret this extraction as a visual-fidelity test pass.
