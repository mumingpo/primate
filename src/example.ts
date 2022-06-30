// import p from '@mumingpo/primate';
import p, { strict, makeEnum } from './index';
import type { InferInternal, InferPrimitive } from './index';

// PrimitiveCodec

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

// ArrayCodec

const dateArrayCodec = p.array(dateCodec);

// returns [dateString, dateString, dateString]
dateArrayCodec.serialize([date, date, date]);

// returns [date, date, date]
dateArrayCodec.deserialize([dateString, dateString, dateString]);

// ObjectCodec

const stringCodec = strict.stringCodec;

const userCodec = p.object({
  name: stringCodec,
  birthDay: dateCodec,
  favoriteColors: p.array(stringCodec),
  pets: p.optional(p.array(p.object({
    name: stringCodec,
    birthDay: p.optional(dateCodec),
  }))),
});

// Schema driven type hints and stuff.

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

// makeEnum
const allowedNumItems = [0, 1, 2, 3] as const;
const numItemsCodec = makeEnum.makeEnumNumberCodec(allowedNumItems);

// returns 0
numItemsCodec.deserialize(0);

// throws Error
numItemsCodec.deserialize(4);

const proteinOptions = ['ham', 'egg', 'cheese'] as const;
const proteinOptionsCodec = makeEnum.makeEnumStringCodec(proteinOptions, 'ham');

// returns 'cheese'
proteinOptionsCodec.deserialize('cheese');

// returns 'ham'
proteinOptionsCodec.deserialize('chicken');
