# Gentle Tai Chi

A six-week tai chi program built for Barb, 72, on her iPad. One HTML
file, no build step, no dependencies. Progress is saved on the device
in localStorage.

## What is inside

- Each week is one workout: that week's moves done in order, guided
  move by move with a timer and breathing circle.
- The weekly goal is the same workout 3 times that week (the frequency
  WHO and CDC guidelines recommend for balance and strength work at
  65+). More is always welcome.
- Every week is open all the time. Nothing locks.
- Each week's page shows all its moves up front, a 7-day dot tracker,
  and "n of 3 done this week".
- 52 moves across 6 weeks (8, 9, 10, 10, 10, 5). Each move: what to
  do, how it helps, two photo slots (start and end position).
- Breathing guide: in for 4 counts, out for 6, about six breaths per
  minute, the pace research supports for older adults.
- Progress page: streak, total workouts, a 3-session ring per week,
  practice-day calendar, and milestone medallions.
- Free Practice: look at or do any single move, any time. Single moves
  do not count toward the weekly 3; they still mark the day active.

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
