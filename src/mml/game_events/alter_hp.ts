import { IGameEvent } from "./game_events";
import { Integer } from "../../utilities/integer";

export interface IEventAlterHP extends IGameEvent {
  body_part: string;
  value: Integer.Signed;
}
