import { PrimitiveCodec } from '../codecs';

const serializer = (s: string) => (s);
const deserializer = (unk: unknown) => {
  if (typeof unk !== 'string') {
    throw new Error(`stringCodec(strict) can only deserialize objects of type "string", not ${typeof unk}.`)
  }
  return unk;
}

const stringCodec = new PrimitiveCodec<string, string>(
  serializer,
  deserializer,
  'stringCodec(strict)',
);

export default stringCodec;
