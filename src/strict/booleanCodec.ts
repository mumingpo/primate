import { PrimitiveCodec } from '../codecs';

const serializer = (b: boolean) => (b);
const deserializer = (unk: unknown) => {
  if (typeof unk !== 'boolean') {
    throw new Error(`booleanCodec(strict) can only deserialize objects of type "boolean", not ${typeof unk}.`)
  }
  return unk;
}

const booleanCodec = new PrimitiveCodec<boolean, boolean>(
  serializer,
  deserializer,
  'booleanCodec(strict)',
);

export default booleanCodec;
