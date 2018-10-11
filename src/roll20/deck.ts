import * as Roll20 from "./roll20";

export interface IDeck extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.Deck;
  readonly _type?: Roll20.ObjectType.Deck;
  get(property: DeckProperties): string;
  set(property: DeckProperties, value: any): void;
  setWithWorker(properties: {[property in DeckProperties]}): void;
}

export enum DeckProperties {

}