import { z } from 'zod';

export type Bindings = {
    HYPERDRIVE: Hyperdrive,
    MAIN_PAGES_URL: string,
    JULISSA_DEV_PAGES_URL: string,
    JMASER_DEV_PAGES_URL: string,
    JWT_SECRET: string,
    ANDY_DEV_PAGES_URL: string,
    SHAWN_DEV_PAGES_URL: string
};

export const PHQ9Request = z.object({
    user_id: z.number(),
    q1: z.number(),
    q2: z.number(),
    q3: z.number(),
    q4: z.number(),
    q5: z.number(),
    q6: z.number(),
    q7: z.number(),
    q8: z.number(),
    q9: z.number()
});

export const EPDSRequest = z.object({
    user_id: z.number(),
    q1: z.number(),
    q2: z.number(),
    q3: z.number(),
    q4: z.number(),
    q5: z.number(),
    q6: z.number(),
    q7: z.number(),
    q8: z.number(),
    q9: z.number(),
    q10: z.number()
});

export const ProjectRequest = z.object({
    expiry_date: z.coerce.date(),
    label: z.string().trim().min(1),
    num_of_therapy_sessions: z.coerce.number().int().positive(),
    session_forms: z.array(z.string().trim().min(1)),
    post_group_forms: z.array(z.string().trim().min(1)).optional(),
    screening_forms: z.array(z.string().trim().min(1)).optional(),
    pre_group_forms: z.array(z.string().trim().min(1)).optional()
});

export const GroupRequest = z.object({
    project_id: z.coerce.number().int().positive(),
    label: z.string().trim().min(1),
    session_dates: z.array(z.coerce.date()).min(1)
});
