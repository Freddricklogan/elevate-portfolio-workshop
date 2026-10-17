/* Site configuration. Edit these values; no other file needs to change. */
/* Edit this file to update a session. Nothing else in the site needs to change. */
window.PW_CONFIG = {
  // One entry per session, Chicago time (America/Chicago), 24-hour clock.
  // The site shows the next session that has not ended yet; ended sessions move to "Past sessions" on the home page.
  // To schedule the next session, add an entry here.
  sessions: [
    { date: "2026-10-08", start: "12:45", end: "13:45", room: "Hermann Hall 010", doors: "12:30" }
  ],
  // Legacy single-event fields: filled in at load time from the next session by assets/site.js. Leave blank.
  eventDate: "", eventTime: "", eventRoom: "",
  checkinUrl: "https://cglink.me/224/c38490410115754",      // 312 self check-in link
  bookingUrl: "https://bookings.cloud.microsoft/bookwithme/user/1503544b91244ca495f66b5e1d2386fe%40illinoistech.edu?anonymous&ismsaljsauthenabled",
  staffEmail: "flogan1@illinoistech.edu",
  /* Microsoft Forms: Portfolio Workshop Live Poll (anyone can respond, no sign-in). Present mode in Forms shows live charts. */
  pollUrl: "https://forms.cloud.microsoft/r/pfXcjYeuB3",
  /* Microsoft Forms: Questions and Feedback (anyone can respond, no sign-in). */
  qaUrl: "https://forms.cloud.microsoft/r/0mf1JThAqw",
  /* Optional: Forms "Embed" code URLs (Collect responses > Embed) to show the form inside the page instead of a button. */
  pollEmbedUrl: "",
  qaEmbedUrl: "",
  formEmbedUrl: ""
};
