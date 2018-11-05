import { Id } from "../../roll20/object";

export interface IGameEvent {
  readonly entity_id: Id;
  [key: string]: any;
}