declare type Converter<Input, Output> = (input: Input) => Output;
interface RequiredCodecInterface<Internal, Primitive> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<unknown, Internal>;
    isOptional: false;
}
interface CodecInterface<Internal, Primitive> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<unknown, Internal>;
    isOptional: boolean;
}
declare type InferInternal<C extends CodecInterface<any, any>> = C extends CodecInterface<infer Internal, any> ? Internal : never;
declare type InferPrimitive<C extends CodecInterface<any, any>> = C extends CodecInterface<any, infer Primitive> ? Primitive : never;
/**
 * A codec converting between a single value
 */
declare class PrimitiveCodec<Internal, Primitive> implements CodecInterface<Internal, Primitive> {
    serialize: Converter<Internal, Primitive>;
    deserialize: Converter<unknown, Internal>;
    isOptional: false;
    name: string;
    constructor(serializer: Converter<Internal, Primitive>, deserializer: Converter<unknown, Internal>, name?: string);
}
/**
 * Apply a codec over an array schema
 */
declare class ArrayCodec<Internal, Primitive> implements CodecInterface<Array<Internal>, Array<Primitive>> {
    codec: CodecInterface<Internal, Primitive>;
    isOptional: false;
    name: string;
    constructor(codec: CodecInterface<Internal, Primitive>, name?: string);
    serialize(obj: Array<Internal>): Primitive[];
    deserialize(obj: unknown): Internal[];
}
declare type Schema = {
    [key: string]: CodecInterface<any, any>;
};
declare type InferObjectInternalAll<S> = {
    [key in keyof S]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never;
};
declare type InferObjectPrimitiveAll<S> = {
    [key in keyof S]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never;
};
declare type InferObjectInternalRequired<S> = {
    [key in keyof S as S[key] extends RequiredCodecInterface<any, any> ? key : never]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never;
};
declare type InferObjectPrimitiveRequired<S> = {
    [key in keyof S as S[key] extends RequiredCodecInterface<any, any> ? key : never]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never;
};
declare type InferObjectInternal<S> = InferObjectInternalRequired<S> & Partial<InferObjectInternalAll<S>>;
declare type InferObjectPrimitive<S> = InferObjectPrimitiveRequired<S> & Partial<InferObjectPrimitiveAll<S>>;
/**
 * Compose a schema of codecs into a single codec
 */
declare class ObjectCodec<S extends Schema> implements CodecInterface<InferObjectInternal<S>, InferObjectPrimitive<S>> {
    schema: S;
    isOptional: false;
    name: string;
    constructor(schema: S, name?: string);
    serialize(obj: InferObjectInternal<S>): InferObjectPrimitive<S>;
    deserialize(obj: unknown): InferObjectInternal<S>;
}
declare class OptionalCodec<Internal, Primitive> implements CodecInterface<Internal | undefined, Primitive | undefined> {
    codec: CodecInterface<Internal, Primitive>;
    isOptional: true;
    name: string;
    constructor(codec: CodecInterface<Internal, Primitive>, name?: string);
    serialize(obj: Internal | undefined): Primitive | undefined;
    deserialize(obj: unknown): Internal | undefined;
}

declare const strict: {
    booleanCodec: PrimitiveCodec<boolean, boolean>;
    numberCodec: PrimitiveCodec<number, number>;
    stringCodec: PrimitiveCodec<string, string>;
};

declare const makeEnum: {
    makeEnumNumberCodec: <T extends readonly number[]>(allowedValues: T, defaultValue?: T[number] | null) => PrimitiveCodec<T[number], T[number]>;
    makeEnumStringCodec: <T_1 extends readonly string[]>(allowedValues: T_1, defaultValue?: T_1[number] | undefined) => PrimitiveCodec<T_1[number], T_1[number]>;
};

declare function primitive<Internal, Primitive>(serializer: Converter<Internal, Primitive>, deserializer: Converter<unknown, Internal>, name?: string): PrimitiveCodec<Internal, Primitive>;
declare function array<Internal, Primitive>(codec: CodecInterface<Internal, Primitive>, name?: string): ArrayCodec<Internal, Primitive>;
declare function object<S extends Schema>(schema: S, name?: string): ObjectCodec<S>;
declare function optional<Internal, Primitive>(codec: CodecInterface<Internal, Primitive>): OptionalCodec<Internal, Primitive>;
declare const primate: {
    primitive: typeof primitive;
    array: typeof array;
    object: typeof object;
    optional: typeof optional;
};

declare type PrimitiveJavaScriptObject = null | boolean | number | string | Array<PrimitiveJavaScriptObject> | {
    [key: string]: PrimitiveJavaScriptObject;
};
declare type PJSO = PrimitiveJavaScriptObject;

export { ArrayCodec, InferInternal, InferPrimitive, ObjectCodec, OptionalCodec, PJSO, PrimitiveCodec, primate as default, makeEnum, strict };
