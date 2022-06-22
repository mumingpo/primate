declare type PrimitiveJavaScriptObject = string | number | boolean | null | Array<PrimitiveJavaScriptObject> | {
    [key: string]: PrimitiveJavaScriptObject;
};
declare type PJSO = PrimitiveJavaScriptObject;
declare type Converter<Input, Output> = (input: Input) => Output;
interface CodecInterface<Internal, Primitive> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<Primitive, Internal>;
}
/**
 * A codec converting between a single value
 */
declare class PrimitiveCodec<Internal, Primitive> implements CodecInterface<Internal, Primitive> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<Primitive, Internal>;
    constructor(serializer: Converter<Internal, Primitive>, deserializer: Converter<Primitive, Internal>);
}
/**
 * Apply a codec over an array schema
 */
declare class ArrayCodec<Internal, Primitive> implements CodecInterface<Array<Internal>, Array<Primitive>> {
    codec: CodecInterface<Internal, Primitive>;
    constructor(codec: CodecInterface<Internal, Primitive>);
    serialize(obj: Array<Internal>): Primitive[];
    deserialize(obj: Array<Primitive>): Internal[];
}
declare type Schema = {
    [key: string]: CodecInterface<any, any>;
};
declare type InferInternal<S> = {
    [key in keyof S]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never;
};
declare type InferPrimitive<S> = {
    [key in keyof S]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never;
};
/**
 * Compose a schema of codecs into a single codec
 */
declare class ObjectCodec<S extends Schema> implements CodecInterface<InferInternal<S>, InferPrimitive<S>> {
    schema: S;
    constructor(schema: S);
    serialize(obj: InferInternal<S>): InferPrimitive<S>;
    deserialize(obj: InferPrimitive<S>): InferInternal<S>;
}
declare function primitive<Internal, Primitive>(serializer: Converter<Internal, Primitive>, deserializer: Converter<Primitive, Internal>): PrimitiveCodec<Internal, Primitive>;
declare function array<Internal, Primitive>(codec: CodecInterface<Internal, Primitive>): ArrayCodec<Internal, Primitive>;
declare function object<S extends Schema>(schema: S): ObjectCodec<S>;
declare const Primate: {
    primitive: typeof primitive;
    array: typeof array;
    object: typeof object;
};

export { ArrayCodec, ObjectCodec, PJSO, PrimitiveCodec, Primate as default };
