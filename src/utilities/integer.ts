export module Integer {
  export type Unsigned = number & { __type: Integer.Unsigned };
  export type Signed = number & { __type: Integer.Signed };
}

