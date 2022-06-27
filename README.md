# primate

## introduction

Primate is developed to:

* facilitate conversion between *internal formats* such as `Date` and *primitive* formats such as `string`.
* enable schema-based API design with type-annotation and stuff.

Heavily influenced by [io-ts](https://www.npmjs.com/package/io-ts), but minus the parts that I didn't like (like seriously, wtf?).

## why?

In my application, I have to convert my working data types between internal types to primitive types at 4 places:

* At the web application while storing at/retriving from localStorage
* At the web application while sending through/receiving from axios requests.
* At the API server while sending through/receiving from connect requests.
* At the API server while storing at/retriving from databases.

This is some serious violation of the DRY principle, and the serialization and deserialization operations are often defined in separate places, making it difficult to organize the code. Additionally, many of the input validation of primitive types are redundant between different input types. Primate is an attempt to organize the code and reduce the amount of redundancy.

## example usage

Example usage could be found in [src/test.ts](https://github.com/mumingpo/primate/blob/main/src/test.ts)

### primitive codec

A primitive codec `serialize` an internal format to a primitive format, and `deserialize` a unknown typed object to an internal format.

Type-checking / validation should be done in the deserializer.

```typescript
import p from '@mumingpo/primate';

const serializer = (d: Date) => (d.toISOString());
const deserializer = (unk: unknown) => {
  const date = new Date(`${unk}`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${unk} cannot be parsed into a date!`);
  }
  return date;
}
const dateCodec = p.primitive(serializer, deserializer, 'dateCodec');

const dateString = '2000-01-01T00:00:00.000Z';
const date = new Date(dateString);

dateCodec.serialize(date);
dateCodec.deserialize(dateString)
```

### array codec

An array codec applies a codec over an array of identical types.

Can nest other objectCodecs and arrayCodecs.

```typescript
const dateArrayCodec = p.array(dateCodec);

dateArrayCodec.serialize([date, date, date]);
dateArrayCodec.deserialize([dateString, dateString, dateString]);
```

### object codec, optional codec

An object codec applies a schema of objects over an object.

Can nest other objectCodecs and arrayCodecs.

```typescript
const stringCodec = ...;

const userCodec = p.object({
  name: stringCodec,
  birthDay: dateCodec,
  favoriteColors: p.array(stringCodec),
  pets: p.optional(p.array(p.object({
    name: stringCodec,
    birthDay: dateCodec,
  }))),
});
```

### InferInternal, InferPrimitive

Generate types from codec to aid in schema-driven design.

```typescript
import { InferInternal, InferPrimitive } from '@mumingpo/primate';

type User = InferInternal<UserCodec>;
type Primate = InferPrimitive<UserCodec>; // cough

user: User = {
  name: 'Test McTestface',
  birthDay: date,
  favoriteColors: ['green', 'color of pass', 'the delicious golden-brown of a freshly made KFC chicken tender'],
  pet: {
    name: 'Pesty McPestface',
    birthDay: date,
  }
};

UserCodec.serialize(user);
```
