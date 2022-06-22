"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ArrayCodec: () => ArrayCodec,
  ObjectCodec: () => ObjectCodec,
  PrimitiveCodec: () => PrimitiveCodec,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var PrimitiveCodec = class {
  serialize;
  deserialize;
  constructor(serializer, deserializer) {
    this.serialize = serializer;
    this.deserialize = deserializer;
  }
};
var ArrayCodec = class {
  codec;
  constructor(codec) {
    this.codec = codec;
  }
  serialize(obj) {
    return obj.map(this.codec.serialize);
  }
  deserialize(obj) {
    return obj.map(this.codec.deserialize);
  }
};
var ObjectCodec = class {
  schema;
  constructor(schema) {
    this.schema = schema;
  }
  serialize(obj) {
    const serialized = Object.fromEntries(Object.entries(this.schema).map((entry) => [entry[0], entry[1].serialize(obj[entry[0]])]));
    return serialized;
  }
  deserialize(obj) {
    const deserialized = Object.fromEntries(Object.entries(this.schema).map((entry) => [entry[0], entry[1].deserialize(obj[entry[0]])]));
    return deserialized;
  }
};
function primitive(serializer, deserializer) {
  return new PrimitiveCodec(serializer, deserializer);
}
function array(codec) {
  return new ArrayCodec(codec);
}
function object(schema) {
  return new ObjectCodec(schema);
}
var Primate = {
  primitive,
  array,
  object
};
var src_default = Primate;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArrayCodec,
  ObjectCodec,
  PrimitiveCodec
});
