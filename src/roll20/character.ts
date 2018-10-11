import * as Roll20 from "./roll20";

export interface ICharacter extends Roll20.IObject{
  readonly type?: Roll20.ObjectType.Character;
  readonly _type?: Roll20.ObjectType.Character;
  avatar?: string;
  name?: string;
  bio?: string;
  gmnotes?: string;
  archived?: boolean;
  inplayerjournals?: string;
  controlledby?: string;
  readonly _defaulttoken?: string;
  get(property: CharacterProperties): string;
  set(property: CharacterProperties, value: any): void;
  setWithWorker(properties: {[property in CharacterProperties]}): void;
}

export enum CharacterProperties {
  Avatar = 'avatar',
  Name = 'name',
  Bio = 'bio',
  GmNotes = 'gmnotes',
  Archived = 'archived',
  InPlayerJournals = 'inplayerjournals',
  ControlledBy = 'controlledby',
}
