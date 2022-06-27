type Converter<Input, Output> = (input: Input) => Output;

interface CodecInterface<Internal, Primitive/* extends PJSO */> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<unknown, Internal>;
}

type InferInternal<C extends CodecInterface<any, any>> = C extends CodecInterface<infer Internal, any> ? Internal : never;
type InferPrimitive<C extends CodecInterface<any, any>> = C extends CodecInterface<any, infer Primitive> ? Primitive : never;

const formatName = (name: string, codecType: string) => (`${codecType}${name ? ` ${name}` : ''}`);

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
      throw new Error(`${formatName(this.name, 'ArrayCodec')} cannot deserialize something that is not an array.`);
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
      Object.entries(this.schema).map((entry) => {
        const key = entry[0];
        const codec = entry[1];
        try {
          const serializedValue = codec.serialize(obj[key]);
          return [key, serializedValue];
        } catch (e) {
          const error = e as Error;
          throw new Error(`${formatName(this.name, 'ObjectCodec')} encountered an error while serializing value with key ${key}:\n${error.message}`);
        }
      }),
    );
    return serialized as InferObjectPrimitive<S>;
  }

  deserialize(obj: unknown) {
    if (typeof obj !== 'object') {
      throw new Error(`${formatName(this.name, 'ObjectCodec')} cannot deserialize something that is not an object.`)
    }

    if (obj === null) {
      throw new Error(`${formatName(this.name, 'ObjectCodec')} cannot deserialize null.`);
    }

    const deserialized = Object.fromEntries(
      Object.entries(this.schema).map((entry) => {
        const [key, codec] = entry;
        if (!hasOwnProperty(obj, key)) {
          throw new Error(`${formatName(this.name, 'ObjectCodec')} cannot deserialize object without key ${key}.`);
        }
        try {
          const deserializedValue = codec.deserialize(obj[key]);
          return [key, deserializedValue];
        } catch (e) {
          const error = e as Error;
          throw new Error(`${formatName(this.name, 'ObjectCodec')} encountered an error while deserializing value with key ${key}:\n${error.message}`);
        }
      }),
    );
    return deserialized as InferObjectInternal<S>;
  }
}

export {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
};
export type {
  Converter,
  CodecInterface,
  Schema,
  InferInternal,
  InferPrimitive,
};
