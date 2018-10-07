export module Integer {
  export type Positive = number & { __type: Integer.Positive };
  export type Signed = number & { __type: Integer.Signed };
  export type Negative = number & { __type: Integer.Negative };
}

