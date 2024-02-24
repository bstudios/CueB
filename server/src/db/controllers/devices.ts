import { Database } from "../database";

export const getDevices = async () => {
  return await Database.db.query.devices.findMany({
    with: {
      connections: true,
    },
  });
};
export type devicesList = Awaited<ReturnType<typeof getDevices>>;
