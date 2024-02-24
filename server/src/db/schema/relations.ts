import { relations } from "drizzle-orm";
import { devices } from "./devices";
import { channels } from "./channels";

export const channelsRelations = relations(channels, ({ many }) => ({
  devices: many(devices),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  channels: one(channels, {
    fields: [devices.channel],
    references: [channels.id],
  }),
}));
