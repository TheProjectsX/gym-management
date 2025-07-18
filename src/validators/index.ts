import { z } from "zod";

const userSchema = z.object({
    name: z.string().min(6),
    email: z.email(),
    password: z.minLength(6),
});

export const validateUser = (data: unknown) => {
    const result = userSchema.safeParse(data);
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
