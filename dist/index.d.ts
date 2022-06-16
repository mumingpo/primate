declare type PrimitiveJavaScriptObject = string | number | boolean | null | Array<PrimitiveJavaScriptObject> | {
    [key: string]: PrimitiveJavaScriptObject;
};
declare type PJSO = PrimitiveJavaScriptObject;
declare type Converter<Input, Output> = (input: Input) => Output;
interface CodecInterface<Internal, Primitive extends PJSO> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<Primitive, Internal>;
}
/**
 * A codec converting between a single value
 */
declare class PrimitiveCodec<Internal, Primitive extends PJSO> implements CodecInterface<Internal, Primitive> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<Primitive, Internal>;
    constructor(serializer: Converter<Internal, Primitive>, deserializer: Converter<Primitive, Internal>);
}
/**
 * Apply a codec over an array schema
 */
declare class ArrayCodec<Internal, Primitive extends PJSO> implements CodecInterface<Array<Internal>, Array<Primitive>> {
    codec: CodecInterface<Internal, Primitive>;
    constructor(codec: CodecInterface<Internal, Primitive>);
    serialize(obj: Array<Internal>): Primitive[];
    deserialize(obj: Array<Primitive>): Internal[];
}
declare type ObjectSchema = Record<string, CodecInterface<unknown, PJSO>>;
declare type InferInternal<Codec extends CodecInterface<any, PJSO>> = (Codec extends CodecInterface<infer Internal, PJSO> ? Internal : never);
declare type InferPrimitive<Codec extends CodecInterface<any, PJSO>> = (Codec extends CodecInterface<unknown, infer Primitive> ? Primitive : never);
declare type InferObjectSchemaInternal<S extends ObjectSchema> = {
    [key in keyof S]: InferInternal<S[key]>;
};
declare type InferObjectSchemaPrimitive<S extends ObjectSchema> = {
    [key in keyof S]: InferPrimitive<S[key]>;
};
/**
 * Apply a codec over an object schema
 */
declare class ObjectCodec<S extends ObjectSchema> implements CodecInterface<InferObjectSchemaInternal<S>, InferObjectSchemaPrimitive<S>> {
    schema: S;
    constructor(schema: S);
    serialize(obj: InferObjectSchemaInternal<S>): InferObjectSchemaPrimitive<S>;
    deserialize(obj: InferObjectSchemaPrimitive<S>): InferObjectSchemaInternal<S>;
}
declare const Primate: {
    primitive: (serializer: Converter<unknown, PJSO>, deserializer: Converter<PJSO, unknown>) => PrimitiveCodec<unknown, PrimitiveJavaScriptObject>;
    array: (codec: CodecInterface<unknown, PJSO>) => ArrayCodec<unknown, PrimitiveJavaScriptObject>;
    object: (schema: ObjectSchema) => ObjectCodec<ObjectSchema>;
};

export { ArrayCodec, ObjectCodec, PrimitiveCodec, Primate as default };
