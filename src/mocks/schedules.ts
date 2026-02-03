export type Schedule = { id: string; time: string; feed: string; amount: string };

export const schedules: Schedule[] = [
  { id: "sch-1", time: "08:00", feed: "Starter Pellets", amount: "200g" },
  { id: "sch-2", time: "18:00", feed: "Grower Pellets", amount: "300g" },
];
