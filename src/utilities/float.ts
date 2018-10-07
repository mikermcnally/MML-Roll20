export module Float {
  export type Positive = number & { __type: Float.Positive };
  export type Signed = number & { __type: Float.Signed };
  export type Negative = number & { __type: Float.Negative };
}