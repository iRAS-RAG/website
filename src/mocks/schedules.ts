export type Schedule = { id: string; time: string; feed: string; amount: string };

let schedules: Schedule[] = [
  { id: "sch-1", time: "08:00", feed: "Starter Pellets", amount: "200g" },
  { id: "sch-2", time: "18:00", feed: "Grower Pellets", amount: "300g" },
];

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function fetchSchedules(): Promise<Schedule[]> {
  await wait();
  return schedules.map((s) => ({ ...s }));
}

export async function createSchedule(payload: Omit<Schedule, "id">): Promise<Schedule> {
  await wait();
  const newItem: Schedule = { id: `sch${Date.now()}`, ...payload };
  schedules.push(newItem);
  return { ...newItem };
}

export async function updateSchedule(id: string, payload: Partial<Schedule>): Promise<Schedule | null> {
  await wait();
  const idx = schedules.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  schedules[idx] = { ...schedules[idx], ...payload };
  return { ...schedules[idx] };
}

export async function deleteSchedule(id: string): Promise<boolean> {
  await wait();
  const before = schedules.length;
  schedules = schedules.filter((s) => s.id !== id);
  return schedules.length < before;
}

export { schedules, schedules as schedulesList };
