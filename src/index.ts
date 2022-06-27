import {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  OptionalCodec,
} from './codecs';

import type {
  InferInternal,
  InferPrimitive,
} from './codecs';

import strict from './strict';
import makeEnum from './makeEnum';
import primate from './primate';

type PrimitiveJavaScriptObject = null | boolean | number | string | Array<PrimitiveJavaScriptObject> | { [key: string]: PrimitiveJavaScriptObject };
type PJSO = PrimitiveJavaScriptObject;

export {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  OptionalCodec,
  strict,
  makeEnum,
};

export default primate;

export type {
  PJSO,
  InferInternal,
  InferPrimitive,
};
