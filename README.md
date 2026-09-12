# MPA-Index Thesis Questionnaire — FINAL v24

This build uses the post-pilot three-mediator questionnaire as the authoritative core instrument and implements the final field-interface requirements.

## Participant interface

- Full post-pilot question wording is retained; item wording is not shortened.
- Likert items are grouped by construct on one screen rather than one question per screen.
- Within each group, full statements appear in a fixed left column and aligned compact 1–5 sliders appear in a fixed right column.
- The agreement legend appears once per group.
- Response option 3 is **Neutral** (Arabic: **محايد**) rather than “Neither”.
- Participant-facing item codes/question counts are hidden.
- A completion percentage and progress bar replace question-number progress.
- Conditional food/drink logic is retained: G2–G5 appear only after Yes to the consumption question.
- Refresh-safe local persistence, reset, offline queue, and Supabase submission remain enabled.

## Final route-image task

The participant sees the image for the selected trail and must click **exactly three points on the image**. There is no category, interpretation, dominant-point, or other entry. The three normalized `(x,y)` coordinates are stored as `TRAIL_IMAGE_FEATURES` together with trail/image metadata.

## Removed

- The final open-ended feedback question (`OPEN1`) is removed.
- Image meaning/tag selection is removed.
- Dominant image marker selection (`TRAIL_IMAGE_DOMINANT`) is removed.

## Researcher analysis page

Open `/research` and enter `RESEARCH_DASHBOARD_KEY`.

The dashboard provides:

- completion and route-distribution metrics;
- item-level N, mean, and 1–5 response frequencies;
- participant route images with the three stored click points overlaid;
- raw point coordinates beside each image;
- per-participant **Download annotated PNG**;
- Excel-ready CSV export with questionnaire responses plus `point_1_x/y`, `point_2_x/y`, and `point_3_x/y`.

## Database compatibility

No Supabase table migration is required from v23. FINAL v24 records are tagged with:

`24.0.0-final-grouped-image-clicks`

The new local-storage key is:

`mpa_index_questionnaire_final_v24`

This prevents unfinished older sessions from being restored into FINAL v24.

## Excel-ready SQL

`FINAL_V24_EXCEL_EXPORT.sql` returns one row per completed FINAL v24 participant and flattens the three image clicks into six numeric coordinate columns.

## Local Windows launch

Run:

`RUN_FINAL_V24_WINDOWS.bat`

Participant URL:

`http://127.0.0.1:4222/thesis-v24?build=24`

Researcher dashboard:

`http://127.0.0.1:4222/research`

## Vercel/Supabase environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEARCH_DASHBOARD_KEY`

Do not commit `.env.local` or any real secret values.
