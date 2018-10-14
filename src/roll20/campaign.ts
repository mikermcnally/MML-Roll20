import * as Roll20 from "./roll20";

export interface IR20Campaign extends Roll20.IR20Object {
  readonly type: Roll20.ObjectType.Campaign;
  readonly _type: Roll20.ObjectType.Campaign;
  turnorder: string;
  initiativepage:	boolean;
  playerpageid:	boolean;
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