"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
    const serialized = Object.keys(obj).map((key) => ({ [key]: this.schema[key].serialize(obj[key]) })).reduce((prev, curr) => __spreadValues(__spreadValues({}, prev), curr));
    return serialized;
  }
  deserialize(obj) {
    const deserialized = Object.keys(obj).map((key) => ({ [key]: this.schema[key].deserialize(obj[key]) })).reduce((prev, curr) => __spreadValues(__spreadValues({}, prev), curr));
    return deserialized;
  }
};
var Primate = {
  primitive: (serializer, deserializer) => new PrimitiveCodec(serializer, deserializer),
  array: (codec) => new ArrayCodec(codec),
  object: (schema) => new ObjectCodec(schema)
};
var src_default = Primate;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArrayCodec,
  ObjectCodec,
  PrimitiveCodec
});
