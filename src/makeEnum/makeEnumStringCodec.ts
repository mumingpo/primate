import { PrimitiveCodec } from '../codecs';

/**
 * Makes a enumStringCodec with proper types and such.
 * Usage: const allowedValues = ['a', 'b', 'c'] as const; const enumStringCodec = makeEnumStringCodec(allowedValues, 'a');
 * @param allowedValues The string values allowed in the enum.
 * @param defaultValue The default value given when deserializing an improper type or value. Must be a value in allowedValues.
 * @throws error when (deserializing objects with inappropriate type or not in allowedValues) and (defaultValue is not provided).
 * @returns CodecInterface<typeof allowedValues[number], typeof allowedValues[number]>
 */
const makeEnumStringCodec = <T extends readonly string[]>(allowedValues: T, defaultValue: T[number] | undefined = undefined) => {
  const serializer = (s: T[number]) => (s);
  const deserializer = (unk: unknown) => {
    if (typeof unk !== 'string') {
      if (defaultValue === undefined) {
        throw new Error(`enumStringCodec (allowedValues: ${allowedValues}) cannot deserialize "${unk} of type ${typeof unk}".`);
      }
      return defaultValue;
    }
    if (!(unk in allowedValues)) {
      if (defaultValue === undefined) {
        throw new Error(`enumStringCodec (allowedValues: ${allowedValues}) does not allow the value "${unk}.`);
      }
      return defaultValue;
    }
    return unk;
  };

  const enumStringCodec = new PrimitiveCodec<T[number], T[number]>(
    serializer,
    deserializer,
    'enumStringCodec  (allowedValues: ${allowedValues})',
  );

  return enumStringCodec;
}

export default makeEnumStringCodec;
