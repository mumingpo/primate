type Converter<Input, Output> = (input: Input) => Output;

interface RequiredCodecInterface<Internal, Primitive> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<unknown, Internal>;
  isOptional: false;
}
interface OptionalCodecInterface<Internal, Primitive> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<unknown, Internal>;
  isOptional: true;
}

interface CodecInterface<Internal, Primitive> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<unknown, Internal>;
  isOptional: boolean;
};

type InferInternal<C extends CodecInterface<any, any>> = C extends CodecInterface<infer Internal, any> ? Internal : never;
type InferPrimitive<C extends CodecInterface<any, any>> = C extends CodecInterface<any, infer Primitive> ? Primitive : never;

const formatName = (name: string, codecType: string) => (`${codecType}${name ? ` ${name}` : ''}`);

/**
 * A codec converting between a single value
 */
class PrimitiveCodec<Internal, Primitive/* extends PJSO */> implements CodecInterface<Internal, Primitive> {
  serialize: Converter<Internal, Primitive>;
  deserialize: Converter<unknown, Internal>;
  isOptional: false;
  name: string;
  
  constructor(serializer: Converter<Internal, Primitive>, deserializer: Converter<unknown, Internal>, name: string = '') {
    this.serialize = serializer;
    this.deserialize = deserializer;
    this.isOptional = false;
    this.name = name;
  }
}

/**
 * Apply a codec over an array schema
 */
class ArrayCodec<Internal, Primitive/* extends PJSO */> implements CodecInterface<Array<Internal>, Array<Primitive>> {
  codec: CodecInterface<Internal, Primitive>;
  isOptional: false;
  name: string;
  
  constructor(codec: CodecInterface<Internal, Primitive>, name: string = '') {
    this.codec = codec;
    this.isOptional = false;
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

type InferObjectInternalAll<S> = { [key in keyof S]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never };
type InferObjectPrimitiveAll<S> = { [key in keyof S]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never };

type InferObjectInternalRequired<S> = {
  [key in keyof S as S[key] extends RequiredCodecInterface<any, any> ? key : never]: S[key] extends CodecInterface<infer Internal, any> ? Internal : never 
};
type InferObjectPrimitiveRequired<S> = {
  [key in keyof S as S[key] extends RequiredCodecInterface<any, any> ? key : never]: S[key] extends CodecInterface<any, infer Primitive> ? Primitive : never 
};

type InferObjectInternal<S> = InferObjectInternalRequired<S> & Partial<InferObjectInternalAll<S>>;
type InferObjectPrimitive<S> = InferObjectPrimitiveRequired<S> & Partial<InferObjectPrimitiveAll<S>>;

// https://fettblog.eu/typescript-hasownproperty/
function hasOwnProperty<T extends {}, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
  return obj.hasOwnProperty(prop);
};

/**
 * Compose a schema of codecs into a single codec
 */
class ObjectCodec<S extends Schema> implements CodecInterface<InferObjectInternal<S>, InferObjectPrimitive<S>> {
  schema: S;
  isOptional: false;
  name: string;

  constructor(schema: S, name: string = '') {
    this.schema = schema;
    this.isOptional = false;
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
          if (!codec.isOptional) {
            throw new Error(`${formatName(this.name, 'ObjectCodec')} cannot deserialize object without key ${key}.`);
          }
          return [key, codec.deserialize(undefined)];
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

class OptionalCodec<Internal, Primitive> implements CodecInterface<Internal | undefined, Primitive | undefined> {
  codec: CodecInterface<Internal, Primitive>;
  isOptional: true;
  name: string;

  constructor(codec: CodecInterface<Internal, Primitive>, name: string = '') {
    this.codec = codec;
    this.isOptional = true;
    this.name = name;
  }

  serialize(obj: Internal | undefined) {
    if (obj === undefined) {
      return undefined;
    }
    return this.codec.serialize(obj);
  }

  deserialize(obj: unknown) {
    if (obj === undefined) {
      return undefined;
    }
    return this.codec.deserialize(obj);
  }
}

export {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  OptionalCodec,
};
export type {
  Converter,
  CodecInterface,
  Schema,
  InferInternal,
  InferPrimitive,
};
