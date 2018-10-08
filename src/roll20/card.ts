import * as Roll20 from "./roll20";

export class Card implements Roll20.IObject, Roll20.ICard {
  readonly type = Roll20.ObjectType.Card;
  readonly id: Roll20.Id;

  get(property: string) {
    return this[property];
  }

  remove() { }

  set(property: string, value: any) {
    this[property] = value;
  }

  setWithWorker(properties: object) {
    Object.assign(this, properties);
  }
}

export interface ICard {

}

export class CardGraphic extends Roll20.Graphic implements Roll20.ICardGraphic{
  readonly type = Roll20.ObjectType.Graphic;
  readonly subtype = Roll20.GraphicTypes.Card;
  readonly id: Roll20.Id;

  get(property: string) {
    return this[property];
  }

  remove() { }

  set(property: string, value: any) {
    this[property] = value;
  }

  setWithWorker(properties: object) {
    Object.assign(this, properties);
  }
}

export interface ICardGraphic {

}
