const SPECIAL_CASES: Record<string, string> = {
	'mr. mime': 'mrmime',
	'mime jr.': 'mimejr',
	'mr. rime': 'mrrime',
	'nidoran♀': 'nidoranf',
	'nidoran♂': 'nidoranm',
	"farfetch'd": 'farfetchd',
	'ho-oh': 'hooh',
	'porygon-z': 'porygonz',
	'type: null': 'typenull',
	'jangmo-o': 'jangmoo',
	'hakamo-o': 'hakamoo',
	'kommo-o': 'kommoo',
	'tapu koko': 'tapukoko',
	'tapu lele': 'tapulele',
	'tapu bulu': 'tapubulu',
	'tapu fini': 'tapufini',
	flabébé: 'flabebe'
};

const REGIONAL_FORMS: Record<string, string> = {
	alolan: 'alola',
	galarian: 'galar',
	hisuian: 'hisui',
	paldean: 'paldea'
};

export function normalizePokemonNameForCry(name: string): string {
	const lower = name.toLowerCase().trim();

	if (SPECIAL_CASES[lower]) {
		return SPECIAL_CASES[lower];
	}

	const megaMatch = lower.match(/^mega (.+?)( [xy])?$/);
	if (megaMatch) {
		const baseName = megaMatch[1].replace(/[^a-z0-9]/g, '');
		const suffix = megaMatch[2] ? megaMatch[2].trim() : '';
		return `${baseName}mega${suffix}`;
	}

	for (const [form, suffix] of Object.entries(REGIONAL_FORMS)) {
		if (lower.startsWith(form + ' ')) {
			const baseName = lower.slice(form.length + 1).replace(/[^a-z0-9]/g, '');
			return `${baseName}${suffix}`;
		}
	}

	return lower.replace(/[^a-z0-9]/g, '');
}

export function getCryPath(pokemonName: string): string {
	const normalized = normalizePokemonNameForCry(pokemonName);
	return `src/assets/audio/cries/${normalized}.mp3`;
}
