import { z } from 'zod';

export const pautaSchema = z.object({
    titulo: z
        .string()
        .min(3, 'O título deve ter pelo menos 3 caracteres.')
        .max(255, 'O título deve ter no máximo 255 caracteres.'),
    descricao: z.string().optional(),
});

export type PautaFormData = z.infer<typeof pautaSchema>;