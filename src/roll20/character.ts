import * as Roll20 from "./roll20";

export class Character implements Roll20.IObject, Roll20.ICharacter {
  readonly id: Roll20.Id;
  readonly _id: Roll20.Id;
  readonly type = Roll20.ObjectType.Character;
  readonly _type = Roll20.ObjectType.Character;

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

  setAttribute(name: Roll20.IAttribute['name'], current: any) {
    const attribute = findObjs({ _character_id: this.id, name })[0];
    if (_.isUndefined(attribute)) {
      createObj(Roll20.ObjectType.Attribute, { _characterid: this.id, name, current } as Roll20.IAttribute);
    } else {
      attribute.set('current', current);
    }
  }

  setAbility() {

  }
}

export interface ICharacter {
  readonly id?: Roll20.Id;
  readonly _id?: Roll20.Id;
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
}