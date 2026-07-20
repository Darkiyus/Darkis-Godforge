import type { AbilityDefinition, DeityDefinition, PassiveBonusDefinition, VisibilityLevel } from "./types";

export interface ViewerContext {
  isGM: boolean;
  isTrusted?: boolean;
  selection?: boolean;
  actorDeityId?: string;
  ownsActor?: boolean;
}

export interface PlayerDeityView {
  id: string;
  name: string;
  title?: string;
  image?: string;
  description?: string;
  quote?: string;
  pantheonIds?: string[];
  domains?: string[];
  alternateDomains?: string[];
  spells?: Record<string, string>;
  favoredWeapon?: string;
  edicts?: string[];
  anathema?: string[];
  passiveBonuses?: PassiveBonusDefinition[];
  abilities?: AbilityDefinition[];
}

export function canViewLevel(level: VisibilityLevel, deityId: string, context: ViewerContext): boolean {
  if (context.isGM) return true;
  const follows = context.actorDeityId === deityId;
  switch (level) {
    case "public": return true;
    case "selection": return context.selection === true;
    case "followers":
    case "hidden-until-selected": return follows;
    case "owner": return follows && context.ownsActor === true;
    case "trusted": return context.isTrusted === true;
    case "gm": return false;
  }
}

export function isDeityVisible(deity: DeityDefinition, context: ViewerContext): boolean {
  if (context.isGM) return true;
  return deity.status === "published" && canViewLevel(deity.visibility.deity, deity.id, context);
}

export function redactForViewer(deity: DeityDefinition, context: ViewerContext): PlayerDeityView | null {
  if (!isDeityVisible(deity, context)) return null;
  const fields = deity.visibility.fields;
  const view: PlayerDeityView = { id: deity.id, name: deity.name, title: deity.title };
  if (canViewLevel(fields.portrait, deity.id, context)) view.image = deity.image;
  if (canViewLevel(fields.description, deity.id, context)) view.description = deity.description;
  if (canViewLevel(fields.quote, deity.id, context)) view.quote = deity.quote;
  if (canViewLevel(fields.pantheon, deity.id, context)) view.pantheonIds = structuredClone(deity.pantheonIds ?? []);
  if (canViewLevel(fields.domains, deity.id, context)) { view.domains = structuredClone(deity.domains); view.alternateDomains = structuredClone(deity.alternateDomains ?? []); }
  if (canViewLevel(fields.spells, deity.id, context)) view.spells = structuredClone(deity.spells ?? {});
  if (canViewLevel(fields.favoredWeapon, deity.id, context)) view.favoredWeapon = deity.favoredWeapon;
  if (canViewLevel(fields.edicts, deity.id, context)) view.edicts = structuredClone(deity.edicts ?? []);
  if (canViewLevel(fields.anathema, deity.id, context)) view.anathema = structuredClone(deity.anathema ?? []);
  if (canViewLevel(fields.bonuses, deity.id, context)) {
    view.passiveBonuses = deity.passiveBonuses
      .filter((bonus) => bonus.enabled !== false && canViewLevel(bonus.visibility ?? "followers", deity.id, context))
      .map((bonus) => redactNumericBonus(bonus, canViewLevel(fields.numericValues, deity.id, context)));
  }
  if (canViewLevel(fields.abilities, deity.id, context)) {
    view.abilities = deity.abilities
      .filter((ability) => ability.enabled !== false && canViewLevel(ability.visibility ?? "followers", deity.id, context))
      .map((ability) => redactAbility(ability, canViewLevel(fields.numericValues, deity.id, context)));
  }
  return view;
}

function redactNumericBonus(bonus: PassiveBonusDefinition, revealNumbers: boolean): PassiveBonusDefinition {
  const copy = structuredClone(bonus);
  if (!revealNumbers) copy.value = "";
  delete copy.visible;
  return copy;
}

function redactAbility(ability: AbilityDefinition, revealNumbers: boolean): AbilityDefinition {
  const copy = structuredClone(ability);
  if (!revealNumbers) {
    copy.effects = copy.effects.filter((effect) => effect.type === "message");
    delete copy.timing;
    delete copy.uses;
    delete copy.duration;
    delete copy.actionCost;
  }
  delete copy.condition;
  return copy;
}
