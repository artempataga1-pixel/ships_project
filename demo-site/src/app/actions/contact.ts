"use server";

import { z } from "zod";
import { PARTNERS } from "@/lib/constants";

const PARTNER_IDS = PARTNERS.map((p) => p.id) as [string, ...string[]];

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Имя — минимум 2 символа").max(100, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .min(5, "Укажите корректный номер")
    .max(30, "Слишком длинный номер"),
  message: z.string().trim().max(2000, "Слишком длинное сообщение").optional(),
  partner: z.enum(PARTNER_IDS, { message: "Выберите партнёра" }),
});

export type ContactFormState = {
  errors?: {
    name?: string[];
    phone?: string[];
    message?: string[];
    partner?: string[];
  };
  success?: boolean;
} | null;

export async function submitContact(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const result = ContactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message") ?? "",
    partner: formData.get("partner"),
  });

  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    return { errors: fieldErrors };
  }

  // Демо: имитация отправки
  await new Promise((resolve) => setTimeout(resolve, 300));

  return { success: true };
}
