import * as Roll20 from "./roll20";

export interface IR20Card extends Roll20.IR20Object{
  readonly type?: Roll20.ObjectType.Card;
  readonly _type?: Roll20.ObjectType.Card;
  get(property: CardProperties | Roll20.ObjectProperties): string;
  set(property: CardProperties, value: any): void;
  setWithWorker(properties: {[property in CardProperties]}): void;
}

export enum CardProperties {

}

export interface IR20CardGraphic extends Roll20.IR20Object {
  readonly type?: Roll20.ObjectType.Graphic;
  readonly _type?: Roll20.ObjectType.Graphic;
  readonly subtype?: Roll20.GraphicTypes.Card;
  readonly _subtype?: Roll20.GraphicTypes.Card;
  get(property: CardGraphicProperties): string;
  set(property: CardGraphicProperties, value: any): void;
  setWithWorker(properties: {[property in CardGraphicProperties]}): void;
}

export enum CardGraphicProperties {

}