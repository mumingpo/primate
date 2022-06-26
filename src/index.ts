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
  deserialize: Converter<unknown, Internal>;
}

type InferInternal<C extends CodecInterface<any, any>> = C extends CodecInterface<infer Internal, any> ? Internal : never;
type InferPrimitive<C extends CodecInterface<any, any>> = C extends CodecInterface<any, infer Primitive> ? Primitive : never;

/**
 * A codec converting between a single value
 */
class PrimitiveCodec<Internal, Primitive/* extends PJSO */> implements CodecInterface<Internal, Primitive> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<unknown, Internal>;
  name: string;
  
  constructor(serializer: Converter<Internal, Primitive>, deserializer: Converter<unknown, Internal>, name: string = '') {
    this.serialize = serializer;
    this.deserialize = deserializer;
    this.name = name;
  }
}

/**
 * Apply a codec over an array schema
 */
class ArrayCodec<Internal, Primitive/* extends PJSO */> implements CodecInterface<Array<Internal>, Array<Primitive>> {
  codec: CodecInterface<Internal, Primitive>;
  name: string;
  
  constructor(codec: CodecInterface<Internal, Primitive>, name: string = '') {
    this.codec = codec;
    this.name = name;
  }

  serialize(obj: Array<Internal>) {
    return obj.map(this.codec.serialize);
  }

  deserialize(obj: unknown) {
    if (!Array.isArray(obj)) {
      throw new Error(`ArrayCodec${this.name ? ` ${this.name}` : ''} cannot deserialize something that is not an array.`);
    }
    return obj.map(this.codec.deserialize);
  }
}

// Headache starts here
type Schema = { [key: string]: CodecInterface<any, any> };

type InferObjectInternal<S> = { [key in keyof S]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never };
type InferObjectPrimitive<S> = { [key in keyof S]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never };

// https://fettblog.eu/typescript-hasownproperty/
function hasOwnProperty<T extends {}, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
  return obj.hasOwnProperty(prop);
};

/**
 * Compose a schema of codecs into a single codec
 */
class ObjectCodec<S extends Schema> implements CodecInterface<InferObjectInternal<S>, InferObjectPrimitive<S>> {
  schema: S;
  name: string;

  constructor(schema: S, name: string = '') {
    this.schema = schema;
    this.name = name;
  }

  serialize(obj: InferObjectInternal<S>) {
    const serialized = Object.fromEntries(
      Object.entries(this.schema).map((entry) => ([entry[0], entry[1].serialize(obj[entry[0]])])),
    );
    return serialized as InferObjectPrimitive<S>;
  }

  deserialize(obj: unknown) {
    if (typeof obj !== 'object') {
      throw new Error(`ObjectCodec${this.name ? ` ${this.name}` : ''} cannot deserialize something that is not an object.`)
    }

    if (obj === null) {
      throw new Error(`ObjectCodec${this.name ? ` ${this.name}` : ''} cannot deserialize null.`);
    }

    const deserialized = Object.fromEntries(
      Object.entries(this.schema).map((entry) => {
        const [key, codec] = entry;
        if (!hasOwnProperty(obj, key)) {
          throw new Error(`ObjectCodec${this.name ? ` ${this.name}` : ''} cannot deserialize object without key ${key}.`);
        }
        return [key, codec.deserialize(obj[key])];
      }),
    );
    return deserialized as InferObjectInternal<S>;
  }
}

function primitive<Internal, Primitive/* extends PJSO */>(
  serializer: Converter<Internal, Primitive>,
  deserializer: Converter<unknown, Internal>,
  name: string = '',
) {
  return (new PrimitiveCodec<Internal, Primitive>(serializer, deserializer, name));
};

function array<Internal, Primitive/* extends PJSO */>(
  codec: CodecInterface<Internal, Primitive>,
  name: string = '',
) {
  return (new ArrayCodec<Internal, Primitive>(codec, name));
}

function object<S extends Schema>(
  schema: S,
  name: string = '',
) {
  return (new ObjectCodec(schema, name));
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
export type {
  PJSO,
  InferInternal,
  InferPrimitive,
};
