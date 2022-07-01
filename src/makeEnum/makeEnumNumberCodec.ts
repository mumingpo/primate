import { PrimitiveCodec } from '../codecs';

/**
 * Makes a enumNumberCodec with proper types and such.
 * Usage: const allowedValues = [1, 2, 3] as const; const enumStringCodec = makeEnumStringCodec(allowedValues, 1);
 * @param allowedValues The numbers allowed in the enum.
 * @param defaultValue The default value given when deserializing an improper type or value. Must be a value in allowedValues.
 * @throws error when (deserializing objects with inappropriate type or not in allowedValues) and (defaultValue is not provided).
 * @returns CodecInterface<typeof allowedValues[number], typeof allowedValues[number]>
 */
const makeEnumNumberCodec = <T extends readonly number[]>(allowedValues: T, defaultValue: T[number] | null = null) => {
  const serializer = (n: T[number]) => (n);
  const deserializer = (unk: unknown) => {
    if (typeof unk !== 'number') {
      if (defaultValue === null) {
        throw new Error(`enumNumberCodec (allowedValues: ${allowedValues}) cannot deserialize "${unk} of type ${typeof unk}".`);
      }
      return defaultValue;
    }
    if (!(unk in allowedValues)) {
      if (defaultValue === null) {
        throw new Error(`enumNumberCodec (allowedValues: ${allowedValues}) does not allow the value "${unk}.`);
      }
      return defaultValue;
    }
    return unk;
  };

  const enumNumberCodec = new PrimitiveCodec<T[number], T[number]>(
    serializer,
    deserializer,
    'enumNumberCodec  (allowedValues: ${allowedValues})',
  );

  return enumNumberCodec;
}

export default makeEnumNumberCodec;
