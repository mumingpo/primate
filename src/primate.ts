import {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  OptionalCodec,
} from './codecs';

import type {
  Converter,
  CodecInterface,
  Schema,
} from './codecs';

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
  return (new ObjectCodec<S>(schema, name));
}

function optional<Internal, Primitive>(
  codec: CodecInterface<Internal, Primitive>
) {
  return (new OptionalCodec<Internal, Primitive>(codec));
}

const primate = {
  primitive,
  array,
  object,
  optional,
};

export default primate;
