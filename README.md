# DOTS Connect marketing website

Static HTML website with a Vercel contact function. `vercel.json` maps the six public routes to their HTML files. No frontend build step or package installation is needed.

## Local preview

Run `python3 scripts/serve.py` (on Windows, `py scripts/serve.py`) and open `http://localhost:8000`.

The local server supports page rewrites. It returns an error for contact submissions and never sends email. The sample vote, Q&A, and speaker queue run entirely in the browser; only generic analytics events are sent to the existing Plausible integration.

## October 7, 2026 update

- Replaced the animated homepage headline with a focused introduction.
- Moved customer logos directly below the hero and brought readable member screenshots forward.
- Added separate descriptions of DOTS Connect and DOTS-supported events.
- Retained the existing customer quote and case results without introducing new performance claims.
- Reworked the tour around the member view, with optional organizer controls.
- Added select, review, change, and submit steps to the sample ballot. Totals appear after the sample vote closes.
- Added a sample question approval step and an explicit chair action to call a queued speaker.
- Added keyboard navigation between tour tabs and Escape/outside-click handling for mobile navigation.
- Reused existing image assets instead of repeating them as base64 in HTML.
- Clarified voting copy around participation records and secret-ballot choices.

## Validation and remaining review

Completed: all six routes' local links/assets and IDs; JavaScript syntax; DOM-based regression checks for the demo ballot, close/reopen behavior, duplicate protection, reset, safe rendering of question text, moderation, speaker queue, tab keyboard controls, and navigation toggle/Escape. No email was sent.

The GitHub review branch is connected to the existing Vercel project and deploys automatically to Preview. The first preview passed desktop route, image, ballot, Q&A, queue, and reset checks. Mobile-device and screen-reader review remain before merging.

## Editorial revision

- Shortened the homepage to an introduction, two service paths, and customer proof.
- Kept voting setup and reporting on Electronic Voting; meeting tools and Zoom on Meetings & Events.
- Moved company history and support choices to About DOTS.
- Removed repeated logo strips, testimonials, benefit lists, and closing pitches from detail pages.
- Made the demo start directly at the interaction and shortened its instructions.
- Simplified contact and footer wording while preserving form fields and behavior.

## Deployment target

Existing Vercel project: `dots-connect-site3`, team `jp-8201s-projects`.

Use a preview deployment for review before production. The contact handler and its required environment variables are unchanged: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optional `CONTACT_RECIPIENT`. Configure their values in Vercel; do not commit credentials.

Source baseline: `dd0cd5d12838aef7f542cdff468f70157dd66c7a` in `dondadda416/dots-connect-site`.
