type PrimitiveJavaScriptObject = string
  | number
  | boolean
  | null
  | Array<PrimitiveJavaScriptObject>
  | { [key: string]: PrimitiveJavaScriptObject };

type PJSO = PrimitiveJavaScriptObject;

type Converter<Input, Output> = (input: Input) => Output;

interface CodecInterface<Internal, Primitive/* extends PJSO */> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<Primitive, Internal>;
}

/**
 * A codec converting between a single value
 */
class PrimitiveCodec<Internal, Primitive/* extends PJSO */> implements CodecInterface<Internal, Primitive> {
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
class ArrayCodec<Internal, Primitive/* extends PJSO */> implements CodecInterface<Array<Internal>, Array<Primitive>> {
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

// Headache starts here

type Schema = { [key: string]: CodecInterface<any, any> };

type InferInternal<S> = { [key in keyof S]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never };
type InferPrimitive<S> = { [key in keyof S]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never };

/**
 * Compose a schema of codecs into a single codec
 */
class ObjectCodec<S extends Schema> implements CodecInterface<InferInternal<S>, InferPrimitive<S>> {
  schema: S;

  constructor(schema: S) {
    this.schema = schema;
  }

  serialize(obj: InferInternal<S>) {
    const serialized = Object.fromEntries(
      Object.entries(this.schema).map((entry) => ([entry[0], entry[1].serialize(obj[entry[0]])])),
    );
    return serialized as InferPrimitive<S>;
  }

  deserialize(obj: InferPrimitive<S>) {
    const deserialized = Object.fromEntries(
      Object.entries(this.schema).map((entry) => ([entry[0], entry[1].deserialize(obj[entry[0]])])),
    );
    return deserialized as InferInternal<S>;
  }
}

function primitive<Internal, Primitive/* extends PJSO */>(
  serializer: Converter<Internal, Primitive>,
  deserializer: Converter<Primitive, Internal>,
) {
  return (new PrimitiveCodec<Internal, Primitive>(serializer, deserializer));
};

function array<Internal, Primitive/* extends PJSO */>(
  codec: CodecInterface<Internal, Primitive>,
) {
  return (new ArrayCodec<Internal, Primitive>(codec));
}

function object<S extends Schema>(
  schema: S,
) {
  return (new ObjectCodec(schema));
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
};

export default Primate;
export type { PJSO };
