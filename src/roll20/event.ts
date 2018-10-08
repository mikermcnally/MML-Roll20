import * as Roll20 from "./roll20";

export module Event {
  export type Add = string & { __type: Add };
  export type Change = string & { __type: Change };
  export type Chat = string & { __type: Chat };
  export type Destroy = string & { __type: Destroy };
  export type Ready = 'ready';

  export const AddAbility = 'add:ability' as Add;
  export const AddAttribute = 'add:attribute' as Add;
  export const AddCharacter = 'add:character' as Add;
  export const AddGraphic = 'add:graphic' as Add;
  export const AddHandout = 'add:handout' as Add;
  export const AddMacro = 'add:macro' as Add;
  export const AddPath = 'add:path' as Add;
  export const AddRollabletable = 'add:rollabletable' as Add;
  export const AddTableitem = 'add:tableitem' as Add;
  export const AddText = 'add:text' as Add;
  export const DestroyAbility = 'add:ability' as Destroy;
  export const DestroyAttribute = 'add:attribute' as Destroy;
  export const DestroyCharacter = 'add:character' as Destroy;
  export const DestroyGraphic = 'add:graphic' as Destroy;
  export const DestroyHandout = 'add:handout' as Destroy;
  export const DestroyMacro = 'add:macro' as Destroy;
  export const DestroyPath = 'add:path' as Destroy;
  export const DestroyRollabletable = 'add:rollabletable' as Destroy;
  export const DestroyTableitem = 'add:tableitem' as Destroy;
  export const DestroyText = 'add:text' as Destroy;
  export const ChangeCampaignPlayerpageid = 'change:campaign:playerpageid' as Change;
  export const ChangeCampaignTurnorder = 'change:campaign:turnorder' as Change;
  export const ChangeCampaignInitiativepage = 'change:campaign:initiativepage' as Change;
  export const ChangeAbility = 'change:ability' as Change;
  export const ChangeAttribute = 'change:attribute' as Change;
  export const ChangeCharacter = 'change:character' as Change;
  export const ChangeGraphic = 'change:graphic' as Change;
  export const ChangeHandout = 'change:handout' as Change;
  export const ChangeMacro = 'change:macro' as Change;
  export const ChangePath = 'change:path' as Change;
  export const ChangePlayer = 'change:player' as Change;
  export const ChangeRollabletable = 'change:rollabletable' as Change;
  export const ChangeTableitem = 'change:tableitem' as Change;
  export const ChangeText = 'change:text' as Change;
}
