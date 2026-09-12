-- MPA-Index FINAL v24: one row per completed participant, suitable for CSV/Excel export.
-- Filters to FINAL v24 only. The image task is flattened to three x/y coordinate pairs.

WITH pivoted AS (
  SELECT
    submission_id,
    MAX(answer_value) FILTER (WHERE question_id = 'P2') AS status,
    MAX(answer_value) FILTER (WHERE question_id = 'P3') AS age,
    MAX(answer_value) FILTER (WHERE question_id = 'P4') AS gender,
    MAX(answer_value) FILTER (WHERE question_id = 'P5') AS previous_use,
    MAX(answer_value) FILTER (WHERE question_id = 'P6') AS purpose_today,
    MAX(answer_value) FILTER (WHERE question_id = 'P7') AS walking_with,
    MAX(answer_value) FILTER (WHERE question_id = 'P8') AS time_on_trail,
    MAX(answer_value) FILTER (WHERE question_id = 'V1') AS v1,
    MAX(answer_value) FILTER (WHERE question_id = 'V2') AS v2,
    MAX(answer_value) FILTER (WHERE question_id = 'V3') AS v3,
    MAX(answer_value) FILTER (WHERE question_id = 'V4') AS v4,
    MAX(answer_value) FILTER (WHERE question_id = 'V5') AS v5,
    MAX(answer_value) FILTER (WHERE question_id = 'V6') AS v6,
    MAX(answer_value) FILTER (WHERE question_id = 'AUD1') AS aud1,
    MAX(answer_value) FILTER (WHERE question_id = 'AUD2') AS aud2,
    MAX(answer_value) FILTER (WHERE question_id = 'AUD3') AS aud3,
    MAX(answer_value) FILTER (WHERE question_id = 'AUD4') AS aud4,
    MAX(answer_value) FILTER (WHERE question_id = 'AUD5') AS aud5,
    MAX(answer_value) FILTER (WHERE question_id = 'AUD6') AS aud6,
    MAX(answer_value) FILTER (WHERE question_id = 'O1') AS o1,
    MAX(answer_value) FILTER (WHERE question_id = 'O2') AS o2,
    MAX(answer_value) FILTER (WHERE question_id = 'O3') AS o3,
    MAX(answer_value) FILTER (WHERE question_id = 'O4') AS o4,
    MAX(answer_value) FILTER (WHERE question_id = 'T1') AS t1,
    MAX(answer_value) FILTER (WHERE question_id = 'T2') AS t2,
    MAX(answer_value) FILTER (WHERE question_id = 'T3') AS t3,
    MAX(answer_value) FILTER (WHERE question_id = 'T4') AS t4,
    MAX(answer_value) FILTER (WHERE question_id = 'T5') AS t5,
    MAX(answer_value) FILTER (WHERE question_id = 'G1') AS g1,
    MAX(answer_value) FILTER (WHERE question_id = 'G_CONSUMED') AS food_consumed,
    MAX(answer_value) FILTER (WHERE question_id = 'G2') AS g2,
    MAX(answer_value) FILTER (WHERE question_id = 'G3') AS g3,
    MAX(answer_value) FILTER (WHERE question_id = 'G4') AS g4,
    MAX(answer_value) FILTER (WHERE question_id = 'G5') AS g5,
    MAX(answer_value) FILTER (WHERE question_id = 'CTX1') AS ctx1,
    MAX(answer_value) FILTER (WHERE question_id = 'CTX2') AS ctx2,
    MAX(answer_value) FILTER (WHERE question_id = 'CTX3') AS ctx3,
    MAX(answer_value) FILTER (WHERE question_id = 'SAT1') AS sat1,
    MAX(answer_value) FILTER (WHERE question_id = 'SAT2') AS sat2,
    MAX(answer_value) FILTER (WHERE question_id = 'SAT3') AS sat3,
    MAX(answer_value) FILTER (WHERE question_id = 'MEM1') AS mem1,
    MAX(answer_value) FILTER (WHERE question_id = 'MEM2') AS mem2,
    MAX(answer_value) FILTER (WHERE question_id = 'MEM3') AS mem3,
    MAX(answer_value) FILTER (WHERE question_id = 'SEC1') AS sec1,
    MAX(answer_value) FILTER (WHERE question_id = 'SEC2') AS sec2,
    MAX(answer_value) FILTER (WHERE question_id = 'SEC3') AS sec3,
    MAX(answer_value) FILTER (WHERE question_id = 'PI1') AS pi1,
    MAX(answer_value) FILTER (WHERE question_id = 'PI2') AS pi2,
    MAX(answer_value) FILTER (WHERE question_id = 'PI3') AS pi3,
    MAX(answer_value) FILTER (WHERE question_id = 'PD1') AS pd1,
    MAX(answer_value) FILTER (WHERE question_id = 'PD2') AS pd2,
    MAX(answer_value) FILTER (WHERE question_id = 'PD3') AS pd3,
    MAX(answer_value) FILTER (WHERE question_id = 'TRAIL_IMAGE_FEATURES') AS image_features_json,
    MAX(answer_meta->>'image_id') FILTER (WHERE question_id = 'TRAIL_IMAGE_FEATURES') AS trail_image_id,
    MAX(answer_meta->>'image_src') FILTER (WHERE question_id = 'TRAIL_IMAGE_FEATURES') AS trail_image_src
  FROM answers
  GROUP BY submission_id
),
image_parsed AS (
  SELECT p.*,
    CASE WHEN p.image_features_json IS NULL OR btrim(p.image_features_json) = '' THEN '[]'::jsonb ELSE p.image_features_json::jsonb END AS image_features
  FROM pivoted p
),
image_flat AS (
  SELECT
    p.submission_id,
    MAX((e.elem->>'x')::numeric) FILTER (WHERE e.ord = 1) AS point_1_x,
    MAX((e.elem->>'y')::numeric) FILTER (WHERE e.ord = 1) AS point_1_y,
    MAX((e.elem->>'x')::numeric) FILTER (WHERE e.ord = 2) AS point_2_x,
    MAX((e.elem->>'y')::numeric) FILTER (WHERE e.ord = 2) AS point_2_y,
    MAX((e.elem->>'x')::numeric) FILTER (WHERE e.ord = 3) AS point_3_x,
    MAX((e.elem->>'y')::numeric) FILTER (WHERE e.ord = 3) AS point_3_y
  FROM image_parsed p
  LEFT JOIN LATERAL jsonb_array_elements(p.image_features) WITH ORDINALITY AS e(elem, ord) ON TRUE
  GROUP BY p.submission_id
)
SELECT
  ROW_NUMBER() OVER (ORDER BY s.completed_at, s.created_at, s.id) AS participant_no,
  s.id AS submission_id,
  s.questionnaire_version,
  s.completed_at,
  s.language_selected AS language,
  CASE s.selected_trail_id
    WHEN 'trail_2_prince_hasan' THEN 'T1 - Prince Hasan St.'
    WHEN 'trail_3_al_hussain' THEN 'T2 - Al-Hussain Bin Ali St.'
    WHEN 'trail_4_king_talal' THEN 'T3 - King Talal St.'
    ELSE s.selected_trail_id
  END AS trail,
  CASE p.status WHEN 'madaba_resident' THEN 'Madaba resident' WHEN 'visitor_jordan' THEN 'Visitor from elsewhere in Jordan' WHEN 'international_visitor' THEN 'International visitor' ELSE p.status END AS status,
  p.age,
  CASE p.gender WHEN 'female' THEN 'Female' WHEN 'male' THEN 'Male' WHEN 'prefer_not' THEN 'Prefer not to say' ELSE p.gender END AS gender,
  CASE p.previous_use WHEN 'first_visit' THEN 'First visit' WHEN '2_5_visits' THEN '2-5 visits' WHEN '6_plus_visits' THEN '6+ visits' WHEN 'monthly' THEN 'Monthly' WHEN 'weekly_plus' THEN 'Weekly+' ELSE p.previous_use END AS previous_trail_use,
  CASE p.purpose_today WHEN 'sightseeing' THEN 'Sightseeing' WHEN 'shopping_services' THEN 'Shopping/services' WHEN 'work_study' THEN 'Work/study' WHEN 'social_family' THEN 'Social/family' WHEN 'passing_through' THEN 'Passing through' ELSE p.purpose_today END AS main_purpose_today,
  CASE p.walking_with WHEN 'alone' THEN 'Alone' WHEN 'adults_only' THEN 'Adults only' WHEN 'children' THEN 'Child/children' WHEN 'organized_tour' THEN 'Organized tour group' ELSE p.walking_with END AS walking_with,
  CASE p.time_on_trail WHEN '10_19' THEN '10-19 min' WHEN '20_39' THEN '20-39 min' WHEN '40_59' THEN '40-59 min' WHEN '60_plus' THEN '60+ min' ELSE p.time_on_trail END AS time_on_trail,
  p.v1::int AS v1, p.v2::int AS v2, p.v3::int AS v3, p.v4::int AS v4, p.v5::int AS v5, p.v6::int AS v6,
  p.aud1::int AS a1, p.aud2::int AS a2, p.aud3::int AS a3, p.aud4::int AS a4, p.aud5::int AS a5, p.aud6::int AS a6,
  p.o1::int AS o1, p.o2::int AS o2, p.o3::int AS o3, p.o4::int AS o4,
  p.t1::int AS t1, p.t2::int AS t2, p.t3::int AS t3, p.t4::int AS t4, p.t5::int AS t5,
  p.g1::int AS g1,
  CASE p.food_consumed WHEN 'yes' THEN 'Yes' WHEN 'no' THEN 'No' ELSE p.food_consumed END AS consumed_local_food_drink,
  p.g2::int AS g2, p.g3::int AS g3, p.g4::int AS g4, p.g5::int AS g5,
  p.ctx1::int AS ctx1, p.ctx2::int AS ctx2, p.ctx3::int AS ctx3,
  p.sat1::int AS sat1, p.sat2::int AS sat2, p.sat3::int AS sat3,
  p.mem1::int AS mem1, p.mem2::int AS mem2, p.mem3::int AS mem3,
  p.sec1::int AS sec1, p.sec2::int AS sec2, p.sec3::int AS sec3,
  p.pi1::int AS pi1, p.pi2::int AS pi2, p.pi3::int AS pi3,
  p.pd1::int AS pd1, p.pd2::int AS pd2, p.pd3::int AS pd3,
  COALESCE(p.trail_image_id,
    CASE s.selected_trail_id WHEN 'trail_2_prince_hasan' THEN 'ROUTE_PRINCE_HASSAN' WHEN 'trail_3_al_hussain' THEN 'ROUTE_AL_HUSSAIN' WHEN 'trail_4_king_talal' THEN 'ROUTE_KING_TALAL' END
  ) AS trail_image_id,
  COALESCE(p.trail_image_src,
    CASE s.selected_trail_id WHEN 'trail_2_prince_hasan' THEN '/route-selection/prince-hassan.jpg' WHEN 'trail_3_al_hussain' THEN '/route-selection/al-hussain-bin-ali.jpg' WHEN 'trail_4_king_talal' THEN '/route-selection/king-talal.jpg' END
  ) AS trail_image_src,
  f.point_1_x, f.point_1_y, f.point_2_x, f.point_2_y, f.point_3_x, f.point_3_y
FROM submissions s
LEFT JOIN image_parsed p ON p.submission_id = s.id
LEFT JOIN image_flat f ON f.submission_id = s.id
WHERE s.completion_status = 'completed'
  AND s.questionnaire_version = '24.0.0-final-grouped-image-clicks'
ORDER BY s.completed_at, s.created_at, s.id;
