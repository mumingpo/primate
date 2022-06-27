import { PrimitiveCodec } from '../codecs';

const serializer = (n: number) => (n);
const deserializer = (unk: unknown) => {
  if (typeof unk !== 'number') {
    throw new Error(`numberCodec(strict) can only deserialize objects of type "number", not ${typeof unk}.`)
  }
  return unk;
}

const numberCodec = new PrimitiveCodec<number, number>(
  serializer,
  deserializer,
  'numberCodec(strict)',
);

export default numberCodec;
