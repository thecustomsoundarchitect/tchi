# Tai Chi for Barb

A six-week tai chi program built for Barb and other members, with an
iPad-friendly interface. It is a static site with no build step.
Firebase Authentication gives each member an account, and progress is
synced through Cloud Firestore with a local device backup.

This is the light lotus build: watercolour lotus background, large
readable text (nothing under 14px), high contrast black text on the
home screen.

## The app has four tabs

- **Home**: greeting, Start Workout, Breathing exercise, and the
  active module card.
- **Program**: the six modules. A module unlocks after 3 sessions of
  the one before it.
- **Practice**: browse and do individual moves.
- **Progress**: session totals, practice calendar, and reward
  medallions.

## The program

- 6 modules, one per week: Foundation and Awareness, Flowing
  Movements, Building Strength and Balance, Advanced Flow and
  Coordination, Strength and Stability, Complete Integration.
- 52 unique moves. Seated Mountain Pose begins every workout, giving
  the modules 8, 10, 11, 11, 11, and 6 practice steps. Each move has a
  name, a cue for what to do, a duration, and a purpose line.
- Goal: 3 sessions per module, then the next module unlocks.
- Breathing exercise is available any time from Home.

## Photos

IMAGES_NEEDED.md is the checklist of the 104 photos (start and end
position for each of the 52 moves). See that file for filenames.
Photo display is not wired into this build yet; the checklist is the
spec for the filenames so photos can be collected now.

## Files

- `index.html` - the whole app
- `firebase-sync.js` - account sign-in and cloud progress synchronization
- `firestore.rules` - member isolation and administrator access rules
- `firebase.json` / `.firebaserc` - Firebase rule deployment configuration
- `img/` - Barb's exercise photos go here
- `IMAGES_NEEDED.md` - photo checklist (104 files)
- `VIDEOS_NEEDED.md` - video checklist
- `ASK_LATER.md` - open questions for Tammy
