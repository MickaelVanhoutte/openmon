export interface HeldItemData {
	id: number;
	name: string;
	description: string;
	power: number;
	consumable: boolean;
}

export enum HeldItemTrigger {
	ON_SWITCH_IN = 'ON_SWITCH_IN',
	ON_MODIFY_ATK = 'ON_MODIFY_ATK',
	ON_MODIFY_DEF = 'ON_MODIFY_DEF',
	ON_MODIFY_SPA = 'ON_MODIFY_SPA',
	ON_MODIFY_SPD = 'ON_MODIFY_SPD',
	ON_MODIFY_SPEED = 'ON_MODIFY_SPEED',
	ON_MODIFY_DAMAGE = 'ON_MODIFY_DAMAGE',
	ON_MODIFY_MOVE_POWER = 'ON_MODIFY_MOVE_POWER',
	ON_BEFORE_HIT = 'ON_BEFORE_HIT',
	ON_AFTER_HIT = 'ON_AFTER_HIT',
	ON_TURN_END = 'ON_TURN_END',
	ON_STATUS_INFLICTED = 'ON_STATUS_INFLICTED',
	ON_HP_CHANGED = 'ON_HP_CHANGED',
	ON_MOVE_SELECTED = 'ON_MOVE_SELECTED'
}

export interface HeldItemEffect {
	name: string;
	onSwitchIn?(ctx: any): void;
	onModifyAtk?(ctx: any): number;
	onModifyDef?(ctx: any): number;
	onModifySpa?(ctx: any): number;
	onModifySpd?(ctx: any): number;
	onModifySpeed?(ctx: any): number;
	onModifyDamage?(ctx: any): number;
	onModifyMovePower?(ctx: any): number;
	onBeforeHit?(ctx: any): void;
	onAfterHit?(ctx: any): void;
	onTurnEnd?(ctx: any): void;
	onStatusInflicted?(ctx: any): boolean;
	onHpChanged?(ctx: any): void;
	onMoveSelected?(ctx: any): void;
}
