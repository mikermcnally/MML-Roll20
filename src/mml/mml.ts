import { Id } from '../roll20/object';

export * from './character/character';
export * from './main';
export * from './user/user';

export type Round = number & { __type: Round};

export interface GameEvent {
  readonly object_id: Id;
}
