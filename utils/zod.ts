import z from "zod";

export const idParameter = z
  .string({
    error: "id must be a non-empty string",
  })
  .nonempty({
    error: "id must be a non-empty string",
  });
