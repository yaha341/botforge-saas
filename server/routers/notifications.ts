import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getNotifications, markNotificationRead } from "../db";

export const notificationsRouter = router({
  list: protectedProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ input }) => {
    return getNotifications(input.limit ?? 20);
  }),
  markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await markNotificationRead(input.id);
    return { success: true };
  }),
});
