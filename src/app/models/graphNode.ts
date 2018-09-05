import { Status } from "./E_Status";
import { Type } from "./E_Type";

export class graphNode {
    id : string;
    sources : graphNode[];
    outputs : graphNode[];
    clicked : boolean;
    status : Status = Status.Default
    type : Type
}