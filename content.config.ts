import { defineCollection, z } from "astro:content";

const nodes = defineCollection({
  type: "content",
  schema: z
    .object({
      subject: z.string(),
      slug: z.string(),
      title: z.string(),
      level: z.number().optional(),
    })
    .passthrough(),
});

export const collections = { nodes };