https://claude.ai/artifact/CFhkRH8kwAamJcuMGvo4VM


Quest Laguna is a promise-driven church with nine locations across Laguna, Philippines. This system carries its look across the public website, service screens, posters and apps. The dominant pair is red on cream (web) or red on black (posters, big screen). Gold is the accent for dance, youth and celebration.
Voice and content

    Write formal, modern, warm and human. Not marketing, not corporate. No stats bands, no salesy copy.
    Short plain sentences. One idea per sentence. No em-dashes in body text.
    Filipino code-switching is on-brand and intentional ("Isang dekada ng katapatan", "Ten years of God's faithfulness"). Do not "fix" it.
    Speak as "we" (the church) to "you" (the person). Example copy: "We started in 2016 with fifteen people in one small room." "Come as you are."
    Keep internal jargon (SOD, Quest Circle leader titles) off public surfaces. Say "small group" or "Quest Circle" once, then plain words.
    Scripture lines are set in body with the reference in small and fg-faint. Example: 1 Peter 4:10, 2 Corinthians 9:7.
    No emoji in UI copy. Celebration is carried by colour (accent) and type, not emoji.

Colour

    Page ground is bg-default (white on light, near-black on dark). Section bands and cream cards use bg-elevated. Cards inside a band use bg-card.
    Headings sit in fg-default. Body copy sits in fg-muted. Dates, captions and helper text sit in fg-faint. All three meet 4.5:1 on bg-default and bg-elevated in both themes.
    brand (red-500) is for primary buttons, the 34x3 red rule, active dots and chevrons. Hover and press go to brand-press.
    Eyebrows, text links and badge text use brand-text (red-700 on light, red-300 on dark). Never set body copy in red.
    Selected and active states use bg-tint (red-100 on light) with a brand border at 55% for tiles, or solid brand for the active tab pill.
    Dark gradients are allowed on hero slides and the big screen: 120deg red-700 → red-500, or 120deg red-900 → red-700, or 180deg red-900 → ink-1000. Text on them is fg-on-brand.
    accent (gold) is for celebration marks, confetti, "for God's glory!" moments and the second chart series. Gold is not readable as small text on cream; use it at 24px and above or as a fill.
    Charts use viz-1 to viz-4 in order. The empty track behind a bar is viz-track. Label every bar with its value; never rely on colour alone.

Type

    Headings and card titles are Poppins 600 (wordmark family): h1-hero 60, h1 48, h2 40, h3 24, h4 19.
    Body and UI are Manrope (body family): body-lg 18, body 16, body-sm 15, ui 15 semibold for buttons, nav 14 semibold.
    The eyebrow is eyebrow: Manrope 700 12px, uppercase, 0.2em tracking, brand-text. A hero eyebrow opens with ››› chevrons in brand at -0.12em tracking.
    Chips and badges use chip (11px, 0.16em) or micro (10px) uppercase.
    Big-screen and poster headlines use Anton (hero, display-1) or Oswald 700 (display-2), always uppercase. A single answer word on the big screen is set in hero.
    script (Sacramento) and brush (Caveat Brush) are poster accents only. Never use them in app UI.
    All families load from Google Fonts: Anton, Oswald 500–700, Poppins 500–800, Manrope 300–800, Caveat Brush, Sacramento. No local font files.
    Body line-height is 1.6 to 1.75. Headings 1.1 to 1.25.

Spacing, shape, elevation

    Content max-width is 1080px. Page gutter is s-10. Sections pad s-24 vertically (90 to 120px).
    Cards pad 36px top/bottom and s-8 sides, radius r-lg. Large media and the form card use r-xl. Inner photos use r-md. Big-screen panels use r-2xl.
    Every button, chip, badge and dot is a pill (r-pill).
    Grids gap s-5. Two-column sections gap s-16. Stacks inside a card gap s-6.
    Shadows are soft and rare: shadow-card on journey and form cards, shadow-media on hero media and the carousel. Cream cards have no shadow and no border.
    Borders are 1px border. A border that carries meaning (input, outline button) uses border-strong.
    Focus ring: 2px solid focus, 2px offset, on every control.

Motion

    Hovers are 200ms: red buttons darken to brand-press, outline buttons gain a 5% ink wash, cream cards go to cream-100, nav links darken to fg-default.
    Carousel slides move 600ms with cubic-bezier(.4,0,.2,1) and auto-advance every 5s, pause on hover.
    Live results on a screen grow bars over 600ms and fade new words in over 360ms.
    Under prefers-reduced-motion: no auto-advance, no confetti, no growing bars. Values just update.

Imagery

    Photos are warm and candid: congregation, worship team, small groups in homes, a pastor preaching. Radius r-md to r-xl. No stock-looking renders.
    The hero collage is three photos, 1fr 1.6fr 1fr, gap s-4, bottom-aligned.
    Posters may add a paper-grain noise over display type (soft-light, 65%). Never on UI.

Iconography

    Simple 2px-stroke line icons: map pin, clock, users, check, phone, bank, Facebook. Lucide is a drop-in match.
    Icons sit in a 44 to 48px brand disc with fg-on-brand stroke when they lead a card.
    The ››› chevron mark is the brand's own glyph. Use it as text in brand, not as an icon file.

Assets

    assets/Logos/logo-mark.png is the round Quest Laguna disc (105px raster). Show it at 38px with a 50% radius next to the wordmark lockup: "Quest" in wordmark, "LAGUNA" in wordmark-sub and brand-text. Request the vector SVG from the client for print.
    assets/Images/campaign-banner.jpg is the NEXTLEVEL Stronger 2026 campaign banner. Use it only for that campaign.

Components

    Button: primary red pill, outline pill, and underlined text link. Consumer provides the label and the click handler.
    Chip: date chips, service badges, team chips, filter tabs. Consumer provides the text and the variant.
    Card: cream card, white bordered card, pinned card. Consumer provides the title, body and optional photo.
    Eyebrow: the uppercase section label, with or without chevrons.
    TextField: input, select and textarea as used on the prayer form. Consumer provides label, value, and required.
    Lockup: logo mark plus wordmark.