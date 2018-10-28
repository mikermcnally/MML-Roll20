import { Id, IR20Object, ObjectType } from "./roll20";

export interface IR20Campaign extends IR20Object {,
  readonly type: ObjectType.Campaign;
  readonly _type: ObjectType.Campaign;
  turnorder: string;
  initiativepage:	boolean;
  playerpageid:	Id;
  playerspecificpages:	boolean;
  readonly _journalfolder: string
  get(property: CampaignProperties): string;
  set(property: CampaignProperties, value: any): void;
  setWithWorker(properties: {[property in CampaignProperties]}): void;
}

export enum CampaignProperties {
  Turnorder = 'turnorder',
  Initiativepage = 'initiativepage',
  Playerpageid = 'playerpageid',
  Playerspecificpages = 'playerspecificpages',
  Journalfolder = 'journalfolder',
}