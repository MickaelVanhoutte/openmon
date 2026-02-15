import biomePoolsData from '../../assets/data/final/beta/biome-pools.json';

export interface BiomePoolEntry {
	id: number;
	name: string;
	weight: number;
}

interface BiomePoolData {
	name: string;
	monsterPool: BiomePoolEntry[];
}

interface BiomePoolsFile {
	biomes: BiomePoolData[];
}

const data = biomePoolsData as BiomePoolsFile;

const biomePoolMap: Map<string, BiomePoolEntry[]> = new Map();
data.biomes.forEach((biome) => {
	biomePoolMap.set(biome.name, biome.monsterPool);
});

export function getBiomePool(biomeName: string): BiomePoolEntry[] {
	return biomePoolMap.get(biomeName) ?? [];
}
