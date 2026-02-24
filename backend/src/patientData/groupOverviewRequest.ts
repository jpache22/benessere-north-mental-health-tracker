import { Hono } from 'hono';
import { getConnection } from '../db/pool';
import { Bindings } from '../types';
import { check_auth_token } from '../index';

// This file provides a route definition to get patient data for the group overview page
// Will access multiple tables

const patientData = new Hono<{Bindings: Bindings}>();

/**
 * Returns the group overview payload for every group associated with a therapist id
 */
patientData.get('/therapist/:therapist_id', async(context) => {
    // from project: screening forms pregroup forms, session forms, postgroup forms
    // from group: session dates
    // for each form will get most recent data from that form (if it exists)
    
    // check role
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== 'therapist') {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }
    // make query to database
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);
    const therapist_id = context.req.param("therapist_id");

    try {
        const result = await client.query(`
            WITH joined_table AS ( 
                SELECT
                    g.group_id, 
                    g.label AS grouplabel, 
                    p.project_id, 
                    p.label AS project_label, 
                    p.screening_forms, 
                    p.pre_group_forms, 
                    p.session_forms,
                    p.post_group_forms, 
                    s.user_id AS patient_id,
                    u.username,
                    COALESCE(s.project_phase, 'session') AS project_phase,
                    s.form_name, 
                    s.total_score,
                    s.responses, 
                    s.completion_date::date AS completion_date 
                FROM all_form_submissions s 
                JOIN public.users u ON u.id = s.user_id 
                LEFT JOIN public.groups g ON g.group_id = u.patient_assigned_group_id 
                LEFT JOIN public.projects p ON p.project_id = g.project_id WHERE g.therapist_id = $1 ),

                non_session_per_row AS ( 
                SELECT group_id, 
                patient_id, 
                username, 
                project_phase, 
                jsonb_object_agg( 
                    form_name, 
                    jsonb_build_object(
                    'responses', responses, 
                    'total_score', total_score, 
                    'completion_date', completion_date ) 
                ) AS forms_by_formname 
                FROM joined_table WHERE project_phase <> 'session' 
                GROUP BY group_id, patient_id, username, project_phase ),

                non_session AS ( 
                SELECT 
                    group_id, 
                    patient_id, 
                    username, 
                    jsonb_object_agg(project_phase, forms_by_formname) AS non_session_forms_by_phase 
                    FROM non_session_per_row 
                    GROUP BY group_id, patient_id, username ),

                session_grouped AS ( 
                SELECT 
                    group_id, 
                    patient_id, 
                    username, 
                    completion_date, 
                    jsonb_object_agg( 
                    form_name, jsonb_build_object('total_score', total_score, 'responses', responses) ) AS forms 
                    FROM joined_table WHERE project_phase = 'session' 
                    GROUP BY group_id, patient_id, username, completion_date ),

                sessions_by_patient AS (
                SELECT 
                    group_id,
                    patient_id, 
                    username, 
                    jsonb_object_agg(completion_date::text, forms) AS session_forms 
                    FROM session_grouped 
                    GROUP BY group_id, patient_id, username ),

                patients_per_group AS ( 
                SELECT 
                    COALESCE(ns.group_id, sp.group_id) AS group_id, 
                    COALESCE(ns.patient_id, sp.patient_id) AS patient_id, 
                    COALESCE(ns.username, sp.username) AS username, 
                    COALESCE(ns.non_session_forms_by_phase, '{}'::jsonb) AS non_session_forms_by_phase, 
                    COALESCE(sp.session_forms, '{}'::jsonb) AS session_forms 
                FROM non_session ns 
                FULL OUTER JOIN sessions_by_patient sp ON ns.patient_id = sp.patient_id AND ns.group_id = sp.group_id ),

                patients_array_per_group AS ( 
                SELECT 
                    group_id, 
                    jsonb_agg( 
                    jsonb_build_object( 
                        'patient_id', patient_id, 
                        'username', username, 
                        'scores', jsonb_strip_nulls( 
                        COALESCE(non_session_forms_by_phase, '{}'::jsonb) || jsonb_build_object('session', COALESCE(session_forms, '{}'::jsonb)) ) ) ) 
                    AS patients 
                    FROM patients_per_group 
                    GROUP BY group_id ),

                groups_base AS ( 
                SELECT 
                    g.group_id, 
                    g.label AS grouplabel, 
                    g.session_dates,
                    g.project_id FROM public.groups g  
                WHERE g.therapist_id = $1 )

                SELECT 
                jsonb_agg( 
                    jsonb_build_object( 
                    'group_id', gb.group_id, 
                    'grouplabel', gb.grouplabel, 
                    'session_dates', gb.session_dates,
                    'project_forms', jsonb_build_object( 'screening', COALESCE(p.screening_forms, ARRAY[]::text[]), 
                    'pregroup', COALESCE(p.pre_group_forms, ARRAY[]::text[]), 
                    'session', COALESCE(p.session_forms, ARRAY[]::text[]), 'postgroup', COALESCE(p.post_group_forms, ARRAY[]::text[]) ), 
                    'patients', COALESCE(pa.patients, '[]'::jsonb) ) ) 
                AS groups 
                FROM groups_base gb 
                LEFT JOIN public.projects p ON p.project_id = gb.project_id 
                LEFT JOIN patients_array_per_group pa ON pa.group_id = gb.group_id;`, [therapist_id]);

        return context.json({ success: true, patientData: result.rows[0]});
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: 'Failed to fetch data' }, 500)
    }

});

/**
 * Returns group overview payload for all groups (admin only)

patientData.get('/admin', async(context) => {
    // from project: screening forms, pregroupforms, sessionForms, and postgroupForms, and session dates
    // from user need name (i dont think we have this rn so just use username)
    // for each user get the form from the session date idk??


});
*/
export default patientData;