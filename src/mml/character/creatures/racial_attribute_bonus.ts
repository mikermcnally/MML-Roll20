export interface IRacialAttributeBonuses {
  readonly strength: number;
  readonly coordination: number;
  readonly health: number;
  readonly beauty: number;
  readonly intellect: number;
  readonly reason: number;
  readonly creativity: number;
  readonly presence: number;
  readonly willpower: number;
  readonly evocation: number;
  readonly perception: number;
  readonly systemStrength: number;
  readonly fitness: number;
  readonly load: number;
}

export class RacialAttributeBonuses {
  static 'Human': IRacialAttributeBonuses = {
    strength: 0,
    coordination: 0,
    health: 0,
    beauty: 0,
    intellect: 0,
    reason: 0,
    creativity: 0,
    presence: 0,
    willpower: 0,
    evocation: 0,
    perception: 0,
    systemStrength: 0,
    fitness: 0,
    load: 0,
  };
  static 'Dwarf': IRacialAttributeBonuses = {
    strength: 3,
    coordination: 0,
    health: 3,
    beauty: 0,
    intellect: 0,
    reason: 0,
    creativity: 0,
    presence: 2,
    willpower: 2,
    evocation: 0,
    perception: 0,
    systemStrength: 3,
    fitness: 0,
    load: 20,
  };
  static 'Gnome': IRacialAttributeBonuses = {
    strength: 2,
    coordination: 0,
    health: 1,
    beauty: 0,
    intellect: 0,
    reason: 0,
    creativity: 0,
    presence: 0,
    willpower: 1,
    evocation: 0,
    perception: 0,
    systemStrength: 1,
    fitness: 0,
    load: 15,
  };
  static 'Hobbit': IRacialAttributeBonuses = {
    strength: 0,
    coordination: 2,
    health: 1,
    beauty: 0,
    intellect: 0,
    reason: 0,
    creativity: 2,
    presence: 0,
    willpower: 2,
    evocation: 5,
    perception: 1,
    systemStrength: 2,
    fitness: 0,
    load: 5,
  };
  static 'Gray Elf': IRacialAttributeBonuses = {
    strength: 0,
    coordination: 1,
    health: 1,
    beauty: 1,
    intellect: 1,
    reason: 0,
    creativity: 1,
    presence: 1,
    willpower: 0,
    evocation: 10,
    perception: 2,
    systemStrength: 2,
    fitness: 0,
    load: 10,
  };
  static 'Wood Elf': IRacialAttributeBonuses = {
    strength: 0,
    coordination: 3,
    health: 1,
    beauty: 0,
    intellect: 0,
    reason: 0,
    creativity: 2,
    presence: 0,
    willpower: 0,
    evocation: 5,
    perception: 2,
    systemStrength: 0,
    fitness: 0,
    load: 5,
  };
}
