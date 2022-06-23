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
  name;
  constructor(serializer, deserializer, name = "") {
    this.serialize = serializer;
    this.deserialize = deserializer;
    this.name = name;
  }
};
var ArrayCodec = class {
  codec;
  name;
  constructor(codec, name = "") {
    this.codec = codec;
    this.name = name;
  }
  serialize(obj) {
    return obj.map(this.codec.serialize);
  }
  deserialize(obj) {
    if (!Array.isArray(obj)) {
      throw new Error(`ArrayCodec${this.name ? ` ${this.name}` : ""} cannot deserialize something that is not an array.`);
    }
    return obj.map(this.codec.deserialize);
  }
};
function hasOwnProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}
var ObjectCodec = class {
  schema;
  name;
  constructor(schema, name = "") {
    this.schema = schema;
    this.name = name;
  }
  serialize(obj) {
    const serialized = Object.fromEntries(Object.entries(this.schema).map((entry) => [entry[0], entry[1].serialize(obj[entry[0]])]));
    return serialized;
  }
  deserialize(obj) {
    if (typeof obj !== "object") {
      throw new Error(`ObjectCodec${this.name ? ` ${this.name}` : ""} cannot deserialize something that is not an object.`);
    }
    if (obj === null) {
      throw new Error(`ObjectCodec${this.name ? ` ${this.name}` : ""} cannot deserialize null.`);
    }
    const deserialized = Object.fromEntries(Object.entries(this.schema).map((entry) => {
      const [key, codec] = entry;
      if (!hasOwnProperty(obj, key)) {
        throw new Error(`ObjectCodec${this.name ? ` ${this.name}` : ""} cannot deserialize object without key ${key}.`);
      }
      return [key, codec.deserialize(obj[key])];
    }));
    return deserialized;
  }
};
function primitive(serializer, deserializer, name = "") {
  return new PrimitiveCodec(serializer, deserializer, name);
}
function array(codec, name = "") {
  return new ArrayCodec(codec, name);
}
function object(schema, name = "") {
  return new ObjectCodec(schema, name);
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
