export type FeedType = { id: string; name: string; protein: string };

let feeds: FeedType[] = [
  { id: "f-1", name: "Starter Pellets", protein: "40%" },
  { id: "f-2", name: "Grower Pellets", protein: "32%" },
];

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function fetchFeeds(): Promise<FeedType[]> {
  await wait();
  return feeds.map((f) => ({ ...f }));
}

export async function createFeed(payload: Omit<FeedType, "id">): Promise<FeedType> {
  await wait();
  const newItem: FeedType = { id: `f${Date.now()}`, ...payload };
  feeds.push(newItem);
  return { ...newItem };
}

export async function updateFeed(id: string, payload: Partial<FeedType>): Promise<FeedType | null> {
  await wait();
  const idx = feeds.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  feeds[idx] = { ...feeds[idx], ...payload };
  return { ...feeds[idx] };
}

export async function deleteFeed(id: string): Promise<boolean> {
  await wait();
  const before = feeds.length;
  feeds = feeds.filter((f) => f.id !== id);
  return feeds.length < before;
}

export { feeds, feeds as feedsList };
