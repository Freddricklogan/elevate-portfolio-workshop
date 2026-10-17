# Elevate Portfolio Development Workshop

Interactive workshop site for Illinois Tech Career Services and Experiential Learning: slides, student handout, live poll, resources, and facilitator guide. Static HTML, CSS, and JavaScript; no build step, no server.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Hub with event details and 312 check-in QR |
| `slides.html` | Presenter deck: arrow keys to advance, `N` for speaker notes, `F` fullscreen, swipe on phones. Includes timers, hand-count tallies, About Me builder, platform match, discipline examples |
| `handout.html` | Student worksheet. Saves on the student's device; download as text, email to Career Services, or print |
| `poll.html` | Live poll. Facilitator tally mode by default; embeds a Microsoft Form or Slido poll when configured |
| `resources.html` | Portal links, platforms, CAR template, blueprint, further reading |
| `qa.html` | Student Q&A: embeds a Microsoft Form when configured, otherwise emails the question. `qa.html#board` projects the open questions |
| `presenter.html` | Presenter view for the laptop screen: current slide, notes, next slide, clock, run of show, question board. Press `P` in the deck to open it |
| `facilitator.html` | Run of show and talking points (staff) |
| `staff.html` | Staff hub, unlisted: setup steps, Forms Present mode, what students leave with |

## Configure

Edit `assets/config.js` only: event date, time, room, check-in link, booking link, staff email, and optional embed URLs.

To let students vote from their phones, create a poll (Microsoft Forms, Slido, Mentimeter, or Poll Everywhere), copy its embed URL, and paste it into `pollEmbedUrl`. To collect worksheets centrally, create a Microsoft Form and paste its embed URL into `formEmbedUrl`. Leave either blank to keep the built-in fallback.

## Deploy on GitHub Pages

1. Create a repository (for example `elevate-portfolio-workshop`) and push these files to the `main` branch.
2. In the repository, open Settings → Pages → Build and deployment → Source: *Deploy from a branch*; Branch: `main`, folder `/ (root)`. Save.
3. The site publishes at `https://<username>.github.io/elevate-portfolio-workshop/` within a minute or two.

## Deploy on your own site

Upload the folder as-is to any static host (for example `fredlogan.phd/portfolio-workshop/`). All paths are relative.

## Update for the next session

To schedule the next session, add an entry to `sessions` in `assets/config.js`:

```js
sessions: [
  { date: "YYYY-MM-DD", start: "12:45", end: "13:45", room: "Hermann Hall 010", doors: "12:30" }
]
```

Dates and times are Chicago time (America/Chicago) on a 24-hour clock. The pages read this list at load time and show the next session that has not ended yet on the home page, slide 1, the handout header, and the presenter and facilitator pages. Once a session's end time passes it moves to the "Past sessions" list on the home page. When nothing is scheduled the pages say "Next workshop: TBD" and the 312 check-in QR is replaced with "Check-in opens at the next session"; booking and Q&A stay live. If the 312 check-in link changes, update `checkinUrl` and replace `assets/checkin-qr.png`.

© Illinois Institute of Technology, Career Services and Experiential Learning. Logo used with permission of the department.
