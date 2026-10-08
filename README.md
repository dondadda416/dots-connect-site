# DOTS Connect marketing website

Static HTML website with a Vercel contact function. `vercel.json` maps six public routes to their HTML files. No frontend build step or package installation is needed.

## Local preview

Run `python3 scripts/serve.py` (on Windows, `py scripts/serve.py`) and open `http://localhost:8000`.

The local server supports page rewrites. It returns an error for contact submissions and never sends email. The member demo runs entirely in the browser; only generic event names are sent to the existing Plausible analytics integration. Questions, ballot choices, and member entries are never included in analytics.

## Current redesign

The shortened site gives each page one purpose: introduction and customer proof on Home, voting setup and records on Electronic Voting, meeting tools and Zoom on Meetings & Events, company history and delivery options on About, and a direct contact form. Existing customer quotes and results are retained.

The demo follows the DOTS Connect v3 member layout, with rounded module tabs at the top on desktop and the bottom on smaller screens:

- Member homepage and an event workspace.
- Vote: select, review, edit answers, cast, and confirmation; duplicate submissions blocked.
- Q&A: submit one sample question, inspect your questions and pinned answers, and expand an example response. No automatic or real moderator response is simulated.
- Queue: request to speak, see position, and leave the queue.
- Agenda and Docs: browse a sample schedule and open an inline sample agenda.
- Keyboard tab navigation, visible focus, status announcements, and full reset.

There are no administrator or organizer controls, results consoles, or real authentication in the demo. It is clearly marked as a local interactive sample, not the live application. Reset/reload clears member input.

## Screenshot provenance

All `v3-member-*.png` assets are original member screenshots extracted without retouching from these DOTS guides:

| Asset | Source |
| --- | --- |
| `v3-member-home.png` | DOTSConnect-Member-View-Companion-v1.1.pdf, page 3 |
| `v3-member-agenda.png` | Same guide, page 5 |
| `v3-member-documents.png` | Same guide, page 6 |
| `v3-member-ballot.png` | Same guide, page 20 |
| `v3-member-questions.png` | DOTS-Connect-QA-Before-a-Strike-or-Ratification-Vote-v5.pdf, page 1 |

The member companion is explicitly labeled DOTS Connect v3, 15 September 2026, demo/test data. The Q&A guide likewise identifies its screenshots as demonstration content. The ballot description was already redacted in the source. Test names and dates are retained; these are not live members or results. Product screenshots replace the older mockups on Home, Electronic Voting, and Meetings & Events, and the demo links to original v3 screens. Social preview images use the actual member homepage. Corporate/customer logos and the About event photograph are retained.

## Validation and remaining review

Local validation covers all six pages' links, assets, anchors and IDs; JavaScript syntax and CSS parsing; ballot review/edit/submit and duplicate guard; safe text rendering and blank-question validation; Q&A tabs; queue join/leave; document open/close; event navigation; keyboard tabs; reset; and no user content in analytics.

Review the Vercel preview before merging. Dedicated mobile-device and screen-reader review remains. The contact handler was not changed and no email was sent.

## Deployment target

Existing Vercel project: `dots-connect-site3`, team `jp-8201s-projects`. Review branch: `improve-website-experience`, draft PR #1. Branch commits deploy automatically to Preview; production is not changed by this revision.

Contact environment variables: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optional `CONTACT_RECIPIENT`. Configure values in Vercel; never commit credentials.

Source baseline: `dd0cd5d12838aef7f542cdff468f70157dd66c7a` in `dondadda416/dots-connect-site`.
