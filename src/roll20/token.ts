import * as Roll20 from "./roll20";
import { Integer } from "../utilities/utilities"

export interface IR20Token extends Roll20.IR20Object{
  readonly type?: Roll20.ObjectType.Graphic;
  readonly _type?: Roll20.ObjectType.Graphic;
  readonly subtype?: Roll20.GraphicTypes.Token;
  readonly _subtype?: Roll20.GraphicTypes.Token;
  readonly pageid?: Roll20.Id;
  readonly _pageid?: Roll20.Id;
  imgsrc?: string;
  bar1_link?: string;
  bar2_link?: string;
  bar3_link?: string;
  represents?: string;
  left?: Integer.Unsigned;
  top?: Integer.Unsigned;
  width?: Integer.Unsigned;
  height?: Integer.Unsigned;
  rotation?: Integer.Unsigned;
  layer?: string;
  isdrawing?: boolean;
  flipv?: boolean;
  fliph?: boolean;
  name?: string;
  gmnotes?: string;
  controlledby?: string;
  bar1_value?: string;
  bar2_value?: string;
  bar3_value?: string;
  bar1_max?: string;
  bar2_max?: string;
  bar3_max?: string;
  aura1_radius?: string;
  aura2_radius?: string;
  aura1_color?: string;
  aura2_color?: string;
  aura1_square?: string;
  aura2_square?: string;
  tint_color?: string;
  statusmarkers?: string;
  showname?: boolean;
  showplayers_name?: boolean;
  showplayers_bar1?: boolean;
  showplayers_bar2?: boolean;
  showplayers_bar3?: boolean;
  showplayers_aura1?: boolean;
  showplayers_aura2?: boolean;
  playersedit_name?: boolean;
  playersedit_bar1?: boolean;
  playersedit_bar2?: boolean;
  playersedit_bar3?: boolean;
  playersedit_aura1?: boolean;
  playersedit_aura2?: boolean;
  light_radius?: string;
  light_dimradius?: string;
  light_otherplayers?: boolean;
  light_hassight?: boolean;
  light_angle?: string;
  light_losangle?: string;
  lastmove?: string;
  light_multiplier?: string;
  adv_fow_view_distance?: string;
  get(property: TokenProperties): string;
  set(property: TokenProperties, value: any): void;
  setWithWorker(properties: {[property in TokenProperties]}): void;
}

export enum TokenProperties {
  Imgsrc = 'imgsrc',
  Bar1Link = 'bar1_link',
  Bar2Link = 'bar2_link',
  Bar3Link = 'bar3_link',
  Represents = 'represents',
  Left = 'left',
  Top = 'top',
  Width = 'width',
  Height = 'height',
  Rotation = 'rotation',
  Layer = 'layer',
  Isdrawing = 'isdrawing',
  Flipv = 'flipv',
  Fliph = 'fliph',
  Name = 'name',
  Gmnotes = 'gmnotes',
  Controlledby = 'controlledby',
  Bar1Value = 'bar1_value',
  Bar2Value = 'bar2_value',
  Bar3Value = 'bar3_value',
  Bar1Max = 'bar1_max',
  Bar2Max = 'bar2_max',
  Bar3Max = 'bar3_max',
  Aura1Radius = 'aura1_radius',
  Aura2Radius = 'aura2_radius',
  Aura1Color = 'aura1_color',
  Aura2Color = 'aura2_color',
  Aura1Square = 'aura1_square',
  Aura2Square = 'aura2_square',
  TintColor = 'tint_color',
  Statusmarkers = 'statusmarkers',
  Showname = 'showname',
  ShowplayersName = 'showplayers_name',
  ShowplayersBar1 = 'showplayers_bar1',
  ShowplayersBar2 = 'showplayers_bar2',
  ShowplayersBar3 = 'showplayers_bar3',
  ShowplayersAura1 = 'showplayers_aura1',
  ShowplayersAura2 = 'showplayers_aura2',
  PlayerseditName = 'playersedit_name',
  PlayerseditBar1 = 'playersedit_bar1',
  PlayerseditBar2 = 'playersedit_bar2',
  PlayerseditBar3 = 'playersedit_bar3',
  PlayerseditAura1 = 'playersedit_aura1',
  PlayerseditAura2 = 'playersedit_aura2',
  LightRadius = 'light_radius',
  LightDimradius = 'light_dimradius',
  LightOtherplayers = 'light_otherplayers',
  LightHassight = 'light_hassight',
  LightAngle = 'light_angle',
  LightLosangle = 'light_losangle',
  Lastmove = 'lastmove',
  LightMultiplier = 'light_multiplier',
  AdvFowViewDistance = 'adv_fow_view_distance',
}