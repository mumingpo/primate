type PrimitiveJavaScriptObject = string
| number
| boolean
| null
| Array<PrimitiveJavaScriptObject>
| { [key: string]: PrimitiveJavaScriptObject };

type PJSO = PrimitiveJavaScriptObject;

type Converter<Input, Output> = (input: Input) => Output;
interface CodecInterface<Internal, Primitive extends PJSO> {
  serialize: Converter<Internal, Primitive>,
  deserialize: Converter<Primitive, Internal>,
}

/**
 * A codec converting between a single value
 */
class PrimitiveCodec<Internal, Primitive extends PJSO> implements CodecInterface<Internal, Primitive> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<Primitive, Internal>;
  
  constructor(serializer: Converter<Internal, Primitive>, deserializer: Converter<Primitive, Internal>) {
    this.serialize = serializer;
    this.deserialize = deserializer;
  }
}

/**
 * Apply a codec over an array schema
 */
class ArrayCodec<Internal, Primitive extends PJSO> implements CodecInterface<Array<Internal>, Array<Primitive>> {
  codec: CodecInterface<Internal, Primitive>;
  
  constructor(codec: CodecInterface<Internal, Primitive>) {
    this.codec = codec;
  }

  serialize(obj: Array<Internal>) {
    return obj.map(this.codec.serialize);
  }

  deserialize(obj: Array<Primitive>) {
    return obj.map(this.codec.deserialize);
  }
}

// Object Codec
type ObjectSchema<T extends unknown = unknown> = Record<string, CodecInterface<T, PJSO>>;

// Infer the Internal, Primitive types given a PrimitiveCodec
type InferInternal<Codec extends CodecInterface<any, PJSO>> = (Codec extends CodecInterface<infer Internal, PJSO> ? Internal : never);
type InferPrimitive<Codec extends CodecInterface<any, PJSO>> = (Codec extends CodecInterface<unknown, infer Primitive> ? Primitive : never);

// Infer the Internal, Primitive types given an ObjectSchema
type InferObjectSchemaInternal<S extends ObjectSchema> = {
  [key in keyof S]: InferInternal<S[key]>
};
type InferObjectSchemaPrimitive<S extends ObjectSchema> = {
  [key in keyof S]: InferPrimitive<S[key]>
};

/**
 * Apply a codec over an object schema
 */
class ObjectCodec<S extends ObjectSchema> implements CodecInterface<InferObjectSchemaInternal<S>, InferObjectSchemaPrimitive<S>> {
  schema: S;

  constructor(schema: S) {
    this.schema = schema;
  }

  serialize(obj: InferObjectSchemaInternal<S>) {
    const serialized = Object.keys(obj)
      .map((key) => ({ [key]: this.schema[key].serialize(obj[key]) }))
      .reduce((prev, curr) => ({ ...prev, ...curr }));
    return serialized as InferObjectSchemaPrimitive<S>;
  }

  deserialize(obj: InferObjectSchemaPrimitive<S>) {
    const deserialized = Object.keys(obj)
      .map((key) => ({ [key]: this.schema[key].deserialize(obj[key]) }))
      .reduce((prev, curr) => ({ ...prev, ...curr }));
    return deserialized as InferObjectSchemaInternal<S>;
  }
}

// ---- Cannot get it to work! ----

// /**
//  * Apply a tuple of codecs over a fixed-length array.
//  */

// type TupleSchema = Array<CodecInterface<unknown, PJSO>>;
// type InferArraySchemaInternal<S extends TupleSchema> = S extends TupleSchema
//   ? { [key in keyof S]: InferSchemaInternal<S[key]> }
//   : never;

function primitive<Internal = unknown, Primitive extends PJSO = PJSO>(
  serializer: Converter<Internal, Primitive>,
  deserializer: Converter<Primitive, Internal>,
) {
  return (new PrimitiveCodec<Internal, Primitive>(serializer, deserializer));
};

function array<Internal = unknown, Primitive extends PJSO = PJSO>(
  codec: CodecInterface<Internal, Primitive>,
) {
  return (new ArrayCodec<Internal, Primitive>(codec));
}

function object<S extends ObjectSchema>(
  schema: S,
) {
  return (new ObjectCodec<S>(schema));
}

const Primate = {
  primitive,
  array,
  object,
};

export {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  // TupleCodec,
};

export default Primate;
