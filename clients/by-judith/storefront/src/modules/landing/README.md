# Landing hero

The home page (`app/[countryCode]/(main)/page.tsx`) is the landing hero from
the legacy repository's `new-hp` branch (`bbc-ng`, staged on top of `df902c9`,
imported 2026-09-30). The design brief it was built to is summarised below. The
e-shop's former front page is at `/shop`.

## What it does

A clip of the clinic's lead doctor plays as a **frame sequence on a canvas**,
driven by scroll. Four claims scroll past her as ordinary content:

| Beat | She looks | Claim | Action |
| --- | --- | --- | --- |
| Klinika | to camera | Snoubíme západ s východem | — |
| Západ | screen left | Efektivita pro moderní život | `/procedury/beauty` |
| Východ | screen right | Revoluce v akupunktuře | `/procedury/akupunktura` |
| Začátek | to camera | Dva směry, jeden cíl | Rezervovat (the header's booking link) |

- Only the stage (canvas, gradients, progress mark) is sticky. The claims
  scroll 1:1; only the resolve holds while she returns to camera.
- The claim nearest the trigger line picks the frame she turns to. She turns
  at the rate she was filmed and never follows the finger frame for frame.
- All links are real anchors present at load. Focusing one by keyboard jumps
  the sequence to its beat.
- With `prefers-reduced-motion: reduce` it renders a static layout: each claim
  under the still it would rest on.
- The hero starts at the top of the page, under the site header, which is
  transparent with light text while it is over the hero (the `overlay:`
  Tailwind variant, `layout/components/header-shell`), and so are its menus'
  panels (dark and see-through). It turns white once the hero has scrolled
  out from under it. The hero repeats the
  header's height to start under it; an e2e test checks the two agree.

Copy and category links are in `hero-animation/config.ts`. The category links
use Content plugin slugs; renaming a category breaks its link.

## Frames

```
public/assets/landing/frames/movie/wide/frame-000.webp … frame-175.webp      3200x1800
public/assets/landing/frames/movie/portrait/frame-000.webp … frame-175.webp  1215x1620
```

Cut from `Movie.mov` (3840x2160 ProRes, 25fps, 7.16s), the take the legacy
demo played at `/landing-demo2`; the owner chose it over `judita_web_1.m4v` as
the smoother one (2026-09-30). Neither clip is stored in this repository: both
are in the legacy repository's `bbc-ng-storefront/public/assets/landing/`. The
takes were shot to the same marks, so the beats fit either. Give any other
take its own frame directory rather than extracting over these; mixing two
extractions makes the shoots appear to cut into each other.

The clip contains a cut between two shoots (different hair and light) between
the 3s and 5s marks. That is in the footage; the page plays one run of frames.

176 frames at 25fps, 0s..7.00s, so **frame index = seconds × 25**. She rests at
1s, 3s, 5s and 7s, and the first beat rests at 1.6s. Frames 0..40 are the
**opening run**: opened at the top, the stage fades in while she lifts her
head. Refreshed further down, it opens on that beat's frame without replaying
the turns before it. The other frames then load outward from the opening frame.

Desktop uses the wide crop as a full-bleed stage; mobile (portrait viewports)
uses the tighter portrait crop. Neither is panned. The only framing change is a
slow push-in.

### Why frames and these sizes

Browsers decode video forwards only; scrubbing back through a `<video>` seeks
per frame and stutters. Frames step both ways at the same cost. 187MB of
ProRes became 7.1MB (wide) + 4.4MB (portrait) of WebP.

The canvas is DPR-scaled up to 2, so a 1512px Retina laptop asks for about
3000 device pixels. 3200 wide covers that. Above it the limit is decode memory,
not bytes: 176 frames at 3200x1800 are about 3.9GB decoded.

### Regenerating

The clip is already 25fps, so frames are taken one for one. `-map 0:v:0` picks
the footage if the file also carries a cover image as a second video stream.

```sh
# Desktop stage
ffmpeg -i Movie.mov -map 0:v:0 -an \
  -vf "fps=25,scale=3200:-2" -frames:v 176 -start_number 0 \
  -c:v libwebp -quality 80 -preset picture \
  frames/movie/wide/frame-%03d.webp

# Mobile: 3:4 centre crop, a little wider than what is displayed
ffmpeg -i Movie.mov -map 0:v:0 -an \
  -vf "fps=25,crop=1620:2160:(iw-1620)/2:0,scale=1215:1620" -frames:v 176 -start_number 0 \
  -c:v libwebp -quality 80 -preset picture \
  frames/movie/portrait/frame-%03d.webp
```

If the timing changes, `FPS`, `CLIP.frameCount` and each beat's `seconds` in
`config.ts` must match what was extracted; `test/landing.test.mjs` checks that
every frame the config names exists. The opening run ends at the first beat's
mark and `FADE_MS` is derived from it, so moving the first beat lengthens both.
The whole run loads before anything is shown, which costs time to first paint.
