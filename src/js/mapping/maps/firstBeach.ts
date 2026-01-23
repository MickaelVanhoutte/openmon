import { OpenMap } from '../maps';
import type { SparseMapData } from '../sparse-collision';
import { NPC } from '../../characters/npc';
import {
	CustomScriptable,
	Dialog,
	GiveMoney,
	HealAll,
	Message,
	MoveToPlayer,
	OpenShop,
	Script,
	StartBattle
} from '../../scripting/scripts';
import { Position } from '../positions';
import { Jonction } from '../collisions';
import { OverworldItem } from '../../items/overworldItem';
import { MenuType } from '../../context/overworldContext';
import { FlagEntry } from '../../scripting/quests';
import { BattleType } from '../../battle/battle-model';

const monsters = Array.from({ length: 233 }, (_, k) => k + 1);

const sparseData: SparseMapData = {
	collisionIndices: [
		40, 140, 148, 190, 289, 290, 298, 340, 433, 434, 435, 436, 437, 438, 439, 448, 490, 582, 583,
		585, 597, 640, 723, 724, 725, 726, 731, 732, 747, 790, 872, 873, 876, 877, 878, 879, 880, 881,
		894, 895, 896, 940, 941, 1022, 1042, 1043, 1091, 1171, 1172, 1192, 1241, 1305, 1306, 1307, 1321,
		1341, 1344, 1345, 1391, 1454, 1455, 1457, 1458, 1470, 1471, 1491, 1494, 1495, 1541, 1542, 1604,
		1608, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1641, 1692, 1753, 1754, 1758, 1759, 1760,
		1761, 1762, 1763, 1791, 1842, 1903, 1940, 1992, 1993, 2039, 2040, 2041, 2042, 2043, 2052, 2053,
		2088, 2089, 2143, 2144, 2186, 2187, 2188, 2189, 2193, 2201, 2202, 2235, 2236, 2237, 2294, 2295,
		2332, 2333, 2334, 2335, 2336, 2339, 2342, 2351, 2380, 2381, 2382, 2383, 2384, 2385, 2445, 2446,
		2468, 2469, 2481, 2482, 2490, 2491, 2500, 2501, 2529, 2596, 2597, 2616, 2617, 2618, 2619, 2620,
		2621, 2631, 2639, 2650, 2678, 2747, 2748, 2749, 2766, 2771, 2781, 2788, 2800, 2827, 2899, 2900,
		2901, 2902, 2908, 2909, 2910, 2911, 2916, 2921, 2922, 2930, 2931, 2938, 2951, 2976, 3052, 3053,
		3054, 3055, 3056, 3057, 3058, 3061, 3062, 3063, 3064, 3065, 3066, 3072, 3080, 3087, 3101, 3125,
		3222, 3228, 3229, 3230, 3237, 3251, 3275, 3372, 3373, 3374, 3375, 3376, 3377, 3378, 3387, 3400,
		3401, 3424, 3515, 3537, 3538, 3539, 3540, 3550, 3570, 3571, 3572, 3573, 3690, 3691, 3699, 3700,
		3719, 3841, 3847, 3848, 3849, 3868, 3991, 3992, 3993, 3994, 3995, 3996, 3997, 4017, 4133, 4134,
		4135, 4167, 4317, 4331, 4332, 4417, 4418, 4419, 4420, 4467, 4481, 4482, 4617, 4767, 4917, 5066,
		5216, 5316, 5317, 5318, 5319, 5366, 5516, 5666, 5687, 5816, 5967, 5972, 5973, 5977, 5978, 6118,
		6122, 6123, 6126, 6129, 6269, 6275, 6277, 6279, 6420, 6421, 6425, 6429, 6572, 6573, 6574, 6580,
		6730, 6880, 7029, 7040, 7041, 7179, 7329, 7472, 7473, 7477, 7478, 7622, 7623, 7627, 7776, 7868,
		7925, 8074, 8223, 8372, 8521, 8670, 8818, 8819, 8967, 9116, 9265, 9282, 9283, 9384, 9415, 9565,
		9715, 9865, 10015, 10027, 10028, 10165, 10315, 10465, 10615, 10765, 10766, 10916, 11066, 11216,
		11366, 11516, 11666, 11672, 11673, 11814, 11816, 11822, 11823, 11966, 11980, 11981, 11982,
		11983, 11984, 11985, 11990, 12116, 12129, 12130, 12135, 12136, 12137, 12267, 12277, 12278,
		12287, 12288, 12289, 12290, 12291, 12418, 12426, 12441, 12442, 12443, 12444, 12569, 12575,
		12594, 12720, 12721, 12722, 12723, 12724, 12745, 12896, 13046, 13193, 13196, 13346, 13495,
		13645, 13795, 13945, 14094, 14244, 14372, 14373, 14374, 14375, 14376, 14377, 14394, 14522,
		14523, 14524, 14525, 14526, 14527, 14544, 14547, 14694, 14844, 14845, 14986, 14995, 15145,
		15295, 15296, 15446, 15447, 15448, 15449
	],
	waterIndices: [
		39, 189, 339, 489, 639, 789, 939, 1089, 1090, 1240, 1390, 1540, 1690, 1691, 1841, 1991, 2141,
		2142, 2292, 2293, 2443, 2444, 2594, 2595, 2745, 2746, 2896, 2897, 2898, 3048, 3049, 3050, 3051,
		3201, 3202, 3203, 3353, 3354, 3355, 3356, 3357, 3358, 3359, 3509, 3510, 3511, 3661, 3662, 3812,
		3813, 3963, 4113, 4263, 4413, 4414, 4564, 4714, 4864, 5014, 5164, 5314, 5464, 5614, 5764, 5914,
		6064, 6214, 6364, 6514, 6664, 6814, 6964, 7114, 7264, 7414, 7564, 7714, 7715, 7865, 8015, 8165,
		8166, 8316, 8466, 8616, 8617, 8767, 8917, 9067, 9068, 9218, 9368, 9518, 9519, 9669, 9819, 9820,
		9970, 10120, 10121, 10271, 10272, 10422, 10423, 10573, 10574, 10724, 10725, 10875, 10876, 11026,
		11027, 11028, 11178, 11179, 11180, 11330, 11331, 11332, 11482, 11483, 11484, 11485, 11486,
		11636, 11637, 11638, 11639, 11789, 11790, 11791, 11792, 11793, 11943, 11944, 11945, 11946,
		11947, 11948, 12098, 12099, 12100, 12101, 12102, 12103, 12253, 12254, 12255, 12256, 12257,
		12407, 12408, 12409, 12410, 12560, 12561, 12562, 12563, 12713, 12714, 12715, 12716, 12866,
		12867, 12868, 13018, 13019, 13169, 13170, 13320, 13321, 13471, 13472, 13622, 13623, 13773,
		13774, 13924, 13925, 14075, 14076, 14226, 14528, 14678, 14828, 14829, 14979, 14980, 15130,
		15131, 15281, 15282, 15283, 15284, 15434, 15435, 15436, 15437, 15438, 15588, 15589, 15590,
		15591, 15592, 15593, 15594, 15595, 15596, 15597, 15598, 15599
	],
	battleIndices: []
};

const shopItems: Record<string, number> = {};
shopItems['4'] = 150;
shopItems['17'] = 150;
shopItems['33'] = 500;
shopItems['28'] = 1250;

const npcs = [
	// new NPC(1, "NPC1", 2, new Position(78, 53), 'down', 'MALE', [], undefined,
	//     new Script('onInteract', [
	//         new MoveToPlayer(1),
	//         new Dialog([
	//             new Message('Hey ! Are you ok ?', 'System'),
	//             new Message('I saw you faint.', 'System'),
	//             new Message('Take this with you.', 'System'),
	//         ]),
	//         new GiveItem(25, 99),
	//         new Dialog([
	//             new Message('You received 5 Potions', 'System'),
	//         ]),
	//         new GiveItem(1, 99),
	//         new Dialog([
	//             new Message('You received 5 Pokeballs', 'System'),
	//             new Message('Take care.', 'System'),
	//         ]),
	//     ]),
	//     [
	//         new Script('onInteract', [new Dialog([
	//             new Message('Something feel strange...', 'System')
	//         ])]),

	//         new Script('onInteract', [
	//             new Dialog([
	//                 new Message('You should head north to the village', 'System'),
	//             ])])
	//     ]
	// ),
	new NPC(
		2,
		'NPC2',
		3,
		new Position(137, 3),
		'down',
		'MALE',
		[112, 114],
		undefined,
		new Script('onSight', [
			new MoveToPlayer(2),
			new Dialog([
				new Message('I found these pokemons while fishing,', '3'),
				new Message("Let's see what you got !", '3')
			]),
			new StartBattle(2),
			new GiveMoney(100), // TODO condition if win
			new Dialog([new Message('You received 100$')])
		])
	),

	// new NPC(3, "NPC3", 2, new Position(122, 85), 'down', 'MALE', [112, 114], undefined,
	//     new Script(
	//         'onSight',
	//         [
	//             new MoveToPlayer(3),
	//             new Dialog([
	//                 new Message('Are you a new trainer ?'),
	//             ]),
	//             new StartBattle(3),
	//             new GiveMoney(100), // TODO condition if win
	//             new Dialog([
	//                 new Message('You received 100$')
	//             ]),
	//             new Dialog([
	//                 new Message('I guess you\'re not...'),
	//             ])
	//         ]
	//     )
	// ),

	new NPC(
		991,
		'NPC1',
		3,
		new Position(86, 27),
		'down',
		'MALE',
		undefined,
		undefined,

		new Script(
			'onInteract2',
			[
				new Dialog([
					new Message('Would you like to rest your Pokemon?', '3', ['Sure', 'No, thanks'])
				]),
				new HealAll(0),
				new Dialog([new Message('Feel free to come back anytime!', '3')])
			],
			undefined,
			true
		),
		undefined,
		undefined,
		true
	),
	new NPC(
		992,
		'NPC2',
		3,
		new Position(84, 26),
		'down',
		'MALE',
		undefined,
		undefined,
		new Script(
			'onInteract2',
			[
				new Dialog([
					new Message('I just received plenty of merchandise, want to take a look ?', '3', [
						'Sure',
						'No, thanks'
					])
				]),
				new OpenShop(shopItems, 0),
				new Dialog([new Message('Feel free to come back anytime!', '3')])
			],
			undefined,
			true
		),
		undefined,
		undefined,
		true
	),

	new NPC(
		4,
		'NPC4',
		4,
		new Position(98, 58),
		'down',
		'MALE',
		[112, 114],
		undefined,
		new Script('onSight', [
			new MoveToPlayer(4),
			new Dialog([new Message("I'm training here everyday !", '4')]),
			new StartBattle(4, BattleType.DOUBLE),
			new GiveMoney(100), // TODO condition if win
			new Dialog([new Message('You received 100$', 'System')]),
			new Dialog([new Message('Let me train now...', '4')])
		]),
		[
			new Script(
				'onInteract',
				[new Dialog([new Message('Let me train now...', '4')])],
				undefined,
				true
			)
		]
		// new Script(
		//     'onEnter',
		//     [
		//         new MoveTo(4, new Position(97, 58)),
		//         new MoveTo(4, new Position(96, 58)),
		//         new MoveTo(4, new Position(95, 58)),
		//         new MoveTo(4, new Position(94, 58)),
		//         new MoveTo(4, new Position(93, 58)),
		//         new MoveTo(4, new Position(92, 58)),
		//         new MoveTo(4, new Position(91, 58)),
		//         new MoveTo(4, new Position(92, 58)),
		//         new MoveTo(4, new Position(93, 58)),
		//         new MoveTo(4, new Position(94, 58)),
		//         new MoveTo(4, new Position(95, 58)),
		//         new MoveTo(4, new Position(96, 58)),
		//         new MoveTo(4, new Position(97, 58)),
		//         new MoveTo(4, new Position(98, 58)),
		//     ], undefined, true
		// )
	)
];

export const firstBeach = OpenMap.fromSparse(
	0,
	'src/assets/maps/First-beach.png',
	150,
	150,
	sparseData,
	monsters,
	new Position(130, 94),
	[3, 6],
	[
		// new Jonction(1,
		//     99, [new Position(86, 29)], new Position(9, 12),
		// ),
		new Jonction(
			2,
			1,
			[
				new Position(141, 0),
				new Position(142, 0),
				new Position(143, 0),
				new Position(144, 0),
				new Position(145, 0),
				new Position(146, 0),
				new Position(147, 0)
			],
			new Position(6, 159)
		)
	],
	'src/assets/maps/First-beach-foreground.png',
	npcs,
	[
		new Script('onGameStart', [
			new Dialog([
				new Message('... Uh...', 'self'),
				new Message('...What happened ?...', 'self'),
				new Message('Where am I ?', 'self'),
				new Message('Is that...', 'self'),
				new Message('The boat. It sunk...', 'self'),
				new Message('What the hell happened?', 'self'),
				new Message('Wait! My stuff!', 'self'),
				new Message("Let's pick it up and find out what happened.", 'self')
			])
		])
	],
	'beach',
	[
		new OverworldItem(
			'Pokeball',
			true,
			new Position(137, 84),
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new Dialog([new Message('You found a Pokeball !', 'System')]),
					new CustomScriptable((ctx) => {
						//ctx.overWorldContext.startScene(SceneType.STARTER_SELECTION);
						ctx.player.monsters[0] = ctx.POKEDEX.findById(50).result?.instanciate(6, 20, true);
						ctx.POKEDEX.setCaught(50);
						ctx.player.setFollower(ctx.player.monsters[0]);
						ctx.validateQuestObjective(0, 0);
					}),
					new CustomScriptable((ctx) => {
						// reverse ctx.player.position.direction
						ctx.player.position.direction = ctx.player.reverseDirection();
					}),
					new Dialog([
						new Message('Eevee !', 'self'),
						new Message('Hopefuly I found you', 'self'),
						new Message('Eeee ! 🤍', 'follower')
					])
				])
			]
		),

		new OverworldItem(
			'Pokeball',
			true,
			new Position(137, 90),
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new Dialog([new Message('You found your pokedex !', 'System')]),
					new CustomScriptable((ctx) => {
						// Pokedex
						ctx.overWorldContext.openMenu(MenuType.MAIN);
						ctx.validateQuestObjective(0, 1);
					})
				])
			]
		),

		new OverworldItem(
			'Pokeball',
			true,
			new Position(128, 90),
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new Dialog([new Message('You found your trainer card !', 'System')]),
					new CustomScriptable((ctx) => {
						// Trainer card
						ctx.overWorldContext.openMenu(MenuType.MAIN);
						ctx.validateQuestObjective(0, 2);
					})
				])
			]
		),

		new OverworldItem(
			'Pokeball',
			true,
			new Position(131, 87),
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new Dialog([new Message('You found your bag !', 'System')]),
					new CustomScriptable((ctx) => {
						// Bag
						ctx.overWorldContext.openMenu(MenuType.MAIN);
						ctx.player.bag.addItems(4, 5, ctx.ITEMS);
						ctx.player.bag.addItems(17, 3, ctx.ITEMS);
						ctx.validateQuestObjective(0, 3);
					})
				])
			]
		),

		new OverworldItem(
			'Pokeball',
			true,
			new Position(135, 94),
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new Dialog([new Message('You found your running shoes !', 'System')]),
					new CustomScriptable((ctx) => {
						// Running shoes
						ctx.flags.setFlag(FlagEntry.RUNNING_SHOES_UNLOCKED, true);
						ctx.validateQuestObjective(0, 4);
					})
				])
			]
		),

		new OverworldItem(
			'Pokeball',
			false,
			new Position(143, 87),
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new Dialog([new Message('You found a Fresh water !', 'System')]),
					new CustomScriptable((ctx) => {
						// Bag
						ctx.overWorldContext.openMenu(MenuType.MAIN);
						ctx.player.bag.addItems(30, 1, ctx.ITEMS);
					})
				])
			]
		)
	]
);
