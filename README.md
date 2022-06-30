# primate

## introduction

Primate is developed to:

* facilitate conversion between *internal formats* such as `Date` and *primitive* formats such as `string` for storage or `JSON.stringify`.
* For reusable types of data, bundle serializing logic with typecheck and validation logic for deserializing operations in a clean interface to be imported anywhere.
* enable schema-based API design with type-annotation and stuff.

Heavily influenced by [io-ts](https://www.npmjs.com/package/io-ts), but minus the parts that I didn't like (like seriously, wtf?).

Although primate works in JavaScript, you need to use TypeScript to take the full advantage of the utility that this package offers.

## why?

In my application, I have to convert my working data types between internal types to primitive types at 4 places:

* At the web application while storing at/retriving from localStorage
* At the web application while sending through/receiving from axios requests.
* At the API server while sending through/receiving from connect requests.
* At the API server while storing at/retriving from databases.

This is some serious violation of the DRY principle, and the serialization and deserialization operations are often defined in separate places, making it difficult to organize the code. Additionally, many of the input validation of primitive types are redundant between different input types. Primate is an attempt to organize the code and reduce the amount of redundancy.

## example usage

You can find some example usage in [example.ts](https://github.com/mumingpo/primate/blob/main/src/example.ts).

### primitive codec

A primitive codec `serialize` an internal format to a primitive format, and `deserialize` a unknown typed object to an internal format.

Type-checking / validation should be done in the deserializer.

```typescript
import p from '@mumingpo/primate';

const serializer = (d: Date) => (d.toISOString());
const deserializer = (unk: unknown) => {
  const date = (typeof unk === 'number')
    ? new Date(unk)
    : new Date(`${unk}`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${unk} cannot be parsed into a date!`);
  }

  return date;
}
const dateCodec = p.primitive(serializer, deserializer, 'dateCodec');

const dateString = '2000-01-01T00:00:00.000Z';
const date = new Date(dateString);

// returns dateString
dateCodec.serialize(date);

// returns date
dateCodec.deserialize(dateString);
```

### array codec

An array codec applies a codec over an array of identical types.

Can nest other objectCodecs and arrayCodecs.

```typescript
const dateArrayCodec = p.array(dateCodec);

// returns [dateString, dateString, dateString]
dateArrayCodec.serialize([date, date, date]);

// returns [date, date, date]
dateArrayCodec.deserialize([dateString, dateString, dateString]);
```

### object codec, optional codec

An object codec applies a schema of objects over an object.

Can nest other objectCodecs and arrayCodecs.

```typescript
const stringCodec = p.primitive(/* ... */);

const userCodec = p.object({
  name: stringCodec,
  birthDay: dateCodec,
  favoriteColors: p.array(stringCodec),
  pets: p.optional(p.array(p.object({
    name: stringCodec,
    birthDay: p.optional(dateCodec),
  }))),
});
```

### InferInternal, InferPrimitive

Generate types from codec to aid in schema-driven design.

```typescript
import type { InferInternal, InferPrimitive } from '@mumingpo/primate';

type User = InferInternal<typeof userCodec>;
type Primate = InferPrimitive<typeof userCodec>; // cough

const user: User = {
  name: 'Test McTestface',
  birthDay: date,
  favoriteColors: ['green', 'color of pass', 'the delicious golden-brown of a freshly made KFC chicken tender'],
  pets: [
    { name: 'Besty McBestface', birthDay: date },
    { name: 'Pesty McPestface' },
  ],
};

// returns that of above with dates replaced by dateStrings
userCodec.serialize(user);

const primate: Primate = {
  name: 'Insert name here',
  birthDay: dateString,
  favoriteColors: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
};

// returns that of above with dateStrings replaced by dates
userCodec.deserialize(primate);
```

### strict codecs

The following "strict" (raises error when deserializing wrong type) primitive codecs for basic types are defined in the `strict` package for your convenience.

```typescript
import { strict } from '@mumingpo/primate';

strict.booleanCodec = p.primitive<boolean, boolean>(/* ... */);
strict.numberCodec = p.primitive<number, number>(/* ... */);
strict.stringCodec = p.primitive<string, string>(/* ... */);
```

### makeEnum

Sometimes you would like to impose a range of allowed values. makeEnum provides utilities to do that for number and string, with or without a default value.

```typescript
import { makeEnum } from '@mumingpo/primate';

const allowedNumItems = [0, 1, 2, 3] as const;
// no default specified
const numItemsCodec = makeEnum.makeEnumNumberCodec(allowedNumItems);

// returns 0
numItemsCodec.deserialize(0);

// throws Error
numItemsCodec.deserialize(4);

const proteinOptions = ['ham', 'egg', 'cheese'] as const;
// default specified
const proteinOptionsCodec = makeEnum.makeEnumStringCodec(proteinOptions, 'ham');

// returns 'cheese'
proteinOptionsCodec.deserialize('cheese');

// returns 'ham'
proteinOptionsCodec.deserialize('chicken');
```
