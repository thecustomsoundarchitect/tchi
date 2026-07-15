# My Tai Chi

A 6-week chair-based tai chi trainer designed for a 72 year old. Plain
HTML, CSS, and JavaScript. No build step, no dependencies. Progress is
stored on the device in localStorage.

## How it works

- One move at a time with a countdown timer. The timer must finish for
  the move to count that day.
- A week unlocks only when every move in the previous week is passed.
- Each completed day grows a watercolor flower in the garden.
- The day-complete screen offers a one-tap pre-written text message.
- Every move links to a real, verified YouTube tutorial.

## Settings

Three constants at the top of `js/program.js`'s companion, `js/app.js`:

- `PASS_DAYS_REQUIRED`: days a move must be completed before it counts
  as passed.
- `FAMILY_PHONES`: comma-separated numbers for the one-tap text.
- `IMAGE_MODE`: `"thumbnail"` uses the still from each move's video;
  any other value loads `img/<move-id>.jpg` instead.

## Checks

`tools/verify_videos.sh` verifies every YouTube id in `js/program.js`
against the oEmbed endpoint and exits nonzero if any link is dead. Run
it after any change to the program data.

## Run locally

Any static server works, for example:

    python3 -m http.server 8642
