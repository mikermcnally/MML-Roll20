export module Float {
  export type Unsigned = number & { __type: Float.Unsigned };
  export type Signed = number & { __type: Float.Signed };
}