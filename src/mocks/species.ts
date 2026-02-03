export type Species = { id: string; name: string; optimalTemp: string };

let species: Species[] = [
  { id: "s-1", name: "Tilapia (Oreochromis niloticus)", optimalTemp: "26-30°C" },
  { id: "s-2", name: "Catfish (Clarias gariepinus)", optimalTemp: "24-28°C" },
];

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function fetchSpecies(): Promise<Species[]> {
  await wait();
  return species.map((s) => ({ ...s }));
}

export async function createSpecies(payload: Omit<Species, "id">): Promise<Species> {
  await wait();
  const newItem: Species = { id: `s${Date.now()}`, ...payload };
  species.push(newItem);
  return { ...newItem };
}

export async function updateSpecies(id: string, payload: Partial<Species>): Promise<Species | null> {
  await wait();
  const idx = species.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  species[idx] = { ...species[idx], ...payload };
  return { ...species[idx] };
}

export async function deleteSpecies(id: string): Promise<boolean> {
  await wait();
  const before = species.length;
  species = species.filter((s) => s.id !== id);
  return species.length < before;
}

export { species, species as speciesList };
