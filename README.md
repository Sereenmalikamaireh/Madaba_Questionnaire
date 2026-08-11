# MPA-Index Thesis Questionnaire — FINAL v22

This build replaces the previous questionnaire content with the items from `thesis questionnaire.docx` while preserving the v20 interaction system:

- three real route photographs
- section-colored segmented 1–5 response control
- refresh-safe local progress persistence
- Reset-to-beginning control with confirmation
- offline queue / research database submission flow
- final selected-route image annotation task

## Thesis questionnaire structure

- Trail identification: T1 Prince Hasan St.; T2 Al-Hussain Bin Ali St.; T3 King Talal St.
- Section A: A1–A7 participant/field record
- Section B: V1–V6, A1–A6 auditory, O1–O4, T1–T5, G1, conditional food/drink question, G2–G5 when applicable
- Section C: CTX1–CTX2 (stored as contextual / not Fuzzy-AHP weighted)
- Section D: SAT1–SAT2, MEM1–MEM2, SEC1–SEC2, ID1–ID2
- Section E: PI1–PI3, PD1–PD3

If the participant answers **No** to consuming food/drink on or immediately beside the trail, G2–G5 are skipped automatically and any previously entered G2–G5 answers are cleared.

## Windows launch

Run:

`RUN_FINAL_V21_WINDOWS.bat`

Dedicated URL:

`http://127.0.0.1:4222/thesis-v22?build=21`

The launcher verifies the v22 source, clears the old `.next` cache, runs a production build, starts the server, and verifies that the served page is the thesis-questionnaire build before opening the browser.
