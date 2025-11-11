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

// might add token for the request, need to discuss
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

export const ProjectRequest = z.object({
    expiry_date: z.coerce.date(),
    label: z.string(),
    num_of_therapy_sessions: z.number(),
    session_forms: z.array(z.string()),
    post_group_forms: z.array(z.string()),
    screening_forms: z.optional(z.array(z.string())),
    pre_group_forms: z.optional(z.array(z.string()))
});

export const GroupRequest = z.object({
    project_id: z.number(),
    label: z.string(),
    session_dates: z.array(z.coerce.date())
});
