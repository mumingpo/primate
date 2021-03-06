"use strict";

// src/codecs.ts
var formatName = (name, codecType) => `${codecType}${name ? ` ${name}` : ""}`;
var PrimitiveCodec = class {
  serialize;
  deserialize;
  isOptional;
  name;
  constructor(serializer4, deserializer4, name = "") {
    this.serialize = serializer4;
    this.deserialize = deserializer4;
    this.isOptional = false;
    this.name = name;
  }
};
var ArrayCodec = class {
  codec;
  isOptional;
  name;
  constructor(codec, name = "") {
    this.codec = codec;
    this.isOptional = false;
    this.name = name;
  }
  serialize(obj) {
    return obj.map((elem) => this.codec.serialize(elem));
  }
  deserialize(obj) {
    if (!Array.isArray(obj)) {
      throw new Error(`${formatName(this.name, "ArrayCodec")} cannot deserialize something that is not an array.`);
    }
    return obj.map((elem) => this.codec.deserialize(elem));
  }
};
function hasProperty(obj, prop) {
  return prop in obj;
}
var ObjectCodec = class {
  schema;
  isOptional;
  name;
  constructor(schema, name = "") {
    this.schema = schema;
    this.isOptional = false;
    this.name = name;
  }
  serialize(obj) {
    const serialized = Object.fromEntries(Object.entries(this.schema).flatMap((entry) => {
      const [key, codec] = entry;
      if (!(key in obj)) {
        if (!codec.isOptional) {
          throw new Error(`${formatName(this.name, "ObjectCodec")} requires key "${key}" to serialize ${obj}.`);
        }
        return [];
      }
      try {
        const serializedValue = codec.serialize(obj[key]);
        return [[key, serializedValue]];
      } catch (e) {
        const error = e;
        throw new Error(`${formatName(this.name, "ObjectCodec")} encountered an error while serializing value with key "${key}":
${error.message}`);
      }
    }));
    return serialized;
  }
  deserialize(obj) {
    if (typeof obj !== "object") {
      throw new Error(`${formatName(this.name, "ObjectCodec")} cannot deserialize something that is not an object.`);
    }
    if (obj === null) {
      throw new Error(`${formatName(this.name, "ObjectCodec")} cannot deserialize null.`);
    }
    const deserialized = Object.fromEntries(Object.entries(this.schema).flatMap((entry) => {
      const [key, codec] = entry;
      if (!hasProperty(obj, key)) {
        if (!codec.isOptional) {
          throw new Error(`${formatName(this.name, "ObjectCodec")} requires key "${key}" to deserialize ${obj}.`);
        }
        return [];
      }
      try {
        const deserializedValue = codec.deserialize(obj[key]);
        return [[key, deserializedValue]];
      } catch (e) {
        const error = e;
        throw new Error(`${formatName(this.name, "ObjectCodec")} encountered an error while deserializing value with key ${key}:
${error.message}`);
      }
    }));
    return deserialized;
  }
};
var OptionalCodec = class {
  codec;
  isOptional;
  name;
  constructor(codec, name = "") {
    this.codec = codec;
    this.isOptional = true;
    this.name = name;
  }
  serialize(obj) {
    if (obj === void 0) {
      return void 0;
    }
    return this.codec.serialize(obj);
  }
  deserialize(obj) {
    if (obj === void 0) {
      return void 0;
    }
    return this.codec.deserialize(obj);
  }
};

// src/strict/booleanCodec.ts
var serializer = (b) => b;
var deserializer = (unk) => {
  if (typeof unk !== "boolean") {
    throw new Error(`booleanCodec(strict) can only deserialize objects of type "boolean", not ${typeof unk}.`);
  }
  return unk;
};
var booleanCodec = new PrimitiveCodec(serializer, deserializer, "booleanCodec(strict)");
var booleanCodec_default = booleanCodec;

// src/strict/numberCodec.ts
var serializer2 = (n) => n;
var deserializer2 = (unk) => {
  if (typeof unk !== "number") {
    throw new Error(`numberCodec(strict) can only deserialize objects of type "number", not ${typeof unk}.`);
  }
  return unk;
};
var numberCodec = new PrimitiveCodec(serializer2, deserializer2, "numberCodec(strict)");
var numberCodec_default = numberCodec;

// src/strict/stringCodec.ts
var serializer3 = (s) => s;
var deserializer3 = (unk) => {
  if (typeof unk !== "string") {
    throw new Error(`stringCodec(strict) can only deserialize objects of type "string", not ${typeof unk}.`);
  }
  return unk;
};
var stringCodec = new PrimitiveCodec(serializer3, deserializer3, "stringCodec(strict)");
var stringCodec_default = stringCodec;

// src/strict/index.ts
var strict = {
  booleanCodec: booleanCodec_default,
  numberCodec: numberCodec_default,
  stringCodec: stringCodec_default
};
var strict_default = strict;

// src/makeEnum/makeEnumNumberCodec.ts
var makeEnumNumberCodec = (allowedValues, defaultValue = void 0) => {
  const serializer4 = (n) => n;
  const deserializer4 = (unk) => {
    if (typeof unk !== "number") {
      if (defaultValue === void 0) {
        throw new Error(`enumNumberCodec (allowedValues: ${allowedValues}) cannot deserialize "${unk}" of type "${typeof unk}".`);
      }
      return defaultValue;
    }
    if (!allowedValues.includes(unk)) {
      if (defaultValue === void 0) {
        throw new Error(`enumNumberCodec (allowedValues: ${allowedValues}) does not allow the value "${unk}".`);
      }
      return defaultValue;
    }
    return unk;
  };
  const enumNumberCodec = new PrimitiveCodec(serializer4, deserializer4, `enumNumberCodec  (allowedValues: ${allowedValues})`);
  return enumNumberCodec;
};
var makeEnumNumberCodec_default = makeEnumNumberCodec;

// src/makeEnum/makeEnumStringCodec.ts
var makeEnumStringCodec = (allowedValues, defaultValue = void 0) => {
  const serializer4 = (s) => s;
  const deserializer4 = (unk) => {
    if (typeof unk !== "string") {
      if (defaultValue === void 0) {
        throw new Error(`enumStringCodec (allowedValues: ${allowedValues}) cannot deserialize "${unk}" of type "${typeof unk}".`);
      }
      return defaultValue;
    }
    if (!allowedValues.includes(unk)) {
      if (defaultValue === void 0) {
        throw new Error(`enumStringCodec (allowedValues: ${allowedValues}) does not allow the value "${unk}".`);
      }
      return defaultValue;
    }
    return unk;
  };
  const enumStringCodec = new PrimitiveCodec(serializer4, deserializer4, `enumStringCodec  (allowedValues: ${allowedValues})`);
  return enumStringCodec;
};
var makeEnumStringCodec_default = makeEnumStringCodec;

// src/makeEnum/index.ts
var makeEnum = {
  makeEnumNumberCodec: makeEnumNumberCodec_default,
  makeEnumStringCodec: makeEnumStringCodec_default
};
var makeEnum_default = makeEnum;

// src/primate.ts
function primitive(serializer4, deserializer4, name = "") {
  return new PrimitiveCodec(serializer4, deserializer4, name);
}
function array(codec, name = "") {
  return new ArrayCodec(codec, name);
}
function object(schema, name = "") {
  return new ObjectCodec(schema, name);
}
function optional(codec) {
  return new OptionalCodec(codec);
}
var primate = {
  primitive,
  array,
  object,
  optional
};
var primate_default = primate;

// src/index.ts
var src_default = primate_default;
export {
  ArrayCodec,
  ObjectCodec,
  OptionalCodec,
  PrimitiveCodec,
  src_default as default,
  makeEnum_default as makeEnum,
  strict_default as strict
};
