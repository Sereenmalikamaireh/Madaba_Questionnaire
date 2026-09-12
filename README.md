# MPA-Index Thesis Questionnaire — FINAL v23

This is the post-pilot thesis questionnaire build based on `thesis questionnaire English- after pilot test - 3 mediators.docx`.

The FINAL v23 build preserves the established fieldwork system while replacing the core English questionnaire items with the post-pilot instrument:

- three real route photographs
- section-colored segmented 1–5 agreement control
- refresh-safe local progress persistence
- Reset-to-beginning control with confirmation
- offline queue / Supabase research-database submission flow
- selected-route image annotation task retained as supplemental data
- optional final open-ended questionnaire feedback retained as supplemental data
- a new local-storage key so v22 pilot answers cannot be restored into v23 sessions
- researcher dashboard/CSV export restricted to FINAL v23 records so pilot records are not mixed with final fieldwork

## FINAL v23 questionnaire structure

- Trail identification: T1 Prince Hasan St.; T2 Al-Hussain Bin Ali St.; T3 King Talal St.
- Section A: A1–A7 participant/field-record questions
- Section B: V1–V6, A1–A6 auditory, O1–O4, T1–T5, G1, conditional food/drink question, G2–G5 when applicable
- Section C: CTX1–CTX3 (contextual / not Fuzzy-AHP weighted)
- Section D: three psychological mediators only: SAT1–SAT3, MEM1–MEM3, SEC1–SEC3
- Section E: PI1–PI3, PD1–PD3
- Removed from the post-pilot core instrument: former D4 / ID1–ID2 block

If the participant answers **No** to consuming food/drink on or immediately beside the trail, G2–G5 are skipped automatically and any previously entered G2–G5 answers are cleared.

## Database compatibility

No Supabase table migration is required when upgrading from v22. Question IDs are stored as text in the existing `answers` table. New final records are tagged with questionnaire version `23.0.0-after-pilot-3-mediators`.

## Excel-ready export

`FINAL_V23_EXCEL_EXPORT.sql` produces one row per completed FINAL v23 participant, includes the updated CTX3/SAT3/MEM3/SEC3 items, parses the three street-image markers into separate columns, derives the dominant image-feature tag, and includes the final open-ended feedback.

## Windows launch

Run:

`RUN_FINAL_V23_WINDOWS.bat`

Dedicated local URL:

`http://127.0.0.1:4222/thesis-v23?build=23`

The launcher verifies the v23 source, clears the old `.next` cache, runs a production build, starts the server, verifies the served questionnaire, then opens the browser.

## Deployment

For Vercel/Supabase deployment, configure these server/environment variables without committing real secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEARCH_DASHBOARD_KEY`

`.env.local` is ignored by Git.
