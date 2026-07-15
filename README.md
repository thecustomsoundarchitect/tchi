# Gentle Tai Chi

A six-week tai chi program built for Barb, 72, on her iPad. One HTML
file, no build step, no dependencies. Progress is saved on the device
in localStorage.

## What is inside

- 52 exercises across 6 weeks (8, 9, 10, 10, 10, 5).
- Each exercise: what to do, how it helps, a countdown timer, and two
  photo slots (start and end position).
- A week unlocks when every exercise in the week before it is done.
- Breathing guide: in for 4 counts, out for 6, about six breaths per
  minute, the pace research supports for older adults.
- Progress page: streak, total practices, a progress ring per week,
  and milestone medallions.
- Free Practice: any exercise, any time, no locks.

## Adding photos

Drop jpg files into `img/` using the exact names in IMAGES_NEEDED.md
(example: `img/w1-01a.jpg`). The app shows them automatically.

## Adding videos

All 52 video fields are blank for now. VIDEOS_NEEDED.md is the
checklist. A video goes live by putting its YouTube id in the matching
exercise's `video` field in index.html.

## Files

- `index.html` - the whole app
- `img/` - Barb's exercise photos go here
- `IMAGES_NEEDED.md` - photo checklist (104 files)
- `VIDEOS_NEEDED.md` - video checklist (52 links)
- `ASK_LATER.md` - open questions for Tammy
