import {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
} from './codecs';

import type {
  Converter,
  CodecInterface,
  Schema,
  InferInternal,
  InferPrimitive,
} from './codecs';

import strict from './strict';
import makeEnum from './makeEnum';

type PrimitiveJavaScriptObject = null | boolean | number | string | Array<PrimitiveJavaScriptObject> | { [key: string]: PrimitiveJavaScriptObject };
type PJSO = PrimitiveJavaScriptObject;

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

export {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  strict,
  makeEnum,
};

export default {
  primitive,
  array,
  object,
};

export type {
  PJSO,
  InferInternal,
  InferPrimitive,
};
