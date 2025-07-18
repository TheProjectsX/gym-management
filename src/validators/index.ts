import { z, type ZodObject } from "zod";

// Schema
const registerSchema = z.object({
    name: z.string().min(6),
    email: z.email(),
    password: z.minLength(6),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.minLength(6),
});

const newScheduleSchema = z.object({
    startTime: z.iso.datetime(),
    trainerId: z.string(),
});

// Actual Validator
const validateSchema = (schema: ZodObject, data: unknown) => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const error = result.error!.issues[0];

        return {
            success: false,
            message: "Validation error occurred.",
            errorDetails: {
                field: error.path[0],
                message: error.message,
            },
        };
    }
    return { success: true, data: result.data };
};

// Validator Instances
export const validateRegister = (data: unknown) => {
    return validateSchema(registerSchema, data);
};

export const validateLogin = (data: unknown) => {
    return validateSchema(loginSchema, data);
};

export const validateSchedule = (data: unknown) => {
    return validateSchema(newScheduleSchema, data);
};
