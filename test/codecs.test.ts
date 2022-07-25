import {
  PrimitiveCodec,
  ArrayCodec,
  ObjectCodec,
  OptionalCodec,
} from '../src/codecs';

const time = 0;
const date = new Date(time);
const dates = [date, date, date];
const dateString = date.toISOString();
const dateStrings = [dateString, dateString, dateString];
const gibberish = 'gibberish';
const gibberishes = [gibberish, gibberish, gibberish];

const dateSerializer = (d: Date) => (d.toISOString());
const dateDeserializer = (unk: unknown) => {
  const date = (typeof unk === 'number')
    ? new Date(unk)
    : new Date(`${unk}`);
  
  if (Number.isNaN(date.getTime())) {
    throw new Error(`dateCodec cannot deserialize ${unk} into a date!`);
  }
  return date;
}
const dateCodec = new PrimitiveCodec(
  dateSerializer,
  dateDeserializer,
  'dateCodec',
)
const dateArrayCodec = new ArrayCodec(dateCodec);

const stringCodec = new PrimitiveCodec(
  (s: string) => (s),
  (unk: unknown) => `${unk}`,
  'stringCodec',
);

test('PrimitiveCodec serialize/deserialize work as expected', () => {
  expect(dateCodec.serialize(date))
    .toBe(dateString);
  expect(dateCodec.deserialize(dateString).getTime())
    .toBe(time);
});

test('PrimitiveCodec passes errors correctly.', () => {
  expect(() => (dateCodec.deserialize(gibberish)))
    .toThrow();
});

test('ArrayCodec serialize/deserialize work as expected', () => {
  expect(dateArrayCodec.serialize(dates))
    .toEqual(dateStrings);
  expect(dateArrayCodec.deserialize(dateStrings).map((d: Date) => (d.getTime())))
    .toEqual([time, time, time]);
});

test('ArrayCodec passes errors correctly.', () => {
  // should not be able to deserialize arbitrary string
  expect(() => (dateArrayCodec.deserialize(gibberishes)))
    .toThrow();
});

test('ObjectCodec serialize/deserialize work as expected', () => {
  const userCodec = new ObjectCodec({
    username: stringCodec,
    birthday: dateCodec,
  });

  const username = 'Pope John XII';
  const user = {
    username,
    birthday: date,
  };
  const unclothedUser = {
    username,
    birthday: dateString,
  };
  const reclothedUser = userCodec.deserialize(unclothedUser);

  expect(userCodec.serialize(user))
    .toEqual(unclothedUser);
  expect(reclothedUser.username)
    .toBe(username);
  expect(reclothedUser.birthday.getTime())
    .toBe(time);
});

test('ArrayCodec(ObjectCode) serialize/deserialize work as expected', () => {
  const userCodec = new ObjectCodec({
    username: stringCodec,
    birthday: dateCodec,
  });
  const usersCodec = new ArrayCodec(userCodec);

  const username = 'Pope John XII';
  const user = {
    username,
    birthday: date,
  };
  const unclothedUser = {
    username,
    birthday: dateString,
  };

  const users = [user, user, user];
  const unclothedUsers = [unclothedUser, unclothedUser, unclothedUser];

  expect(usersCodec.serialize(users))
    .toEqual(unclothedUsers);

  const reclothedUsers = usersCodec.deserialize(unclothedUsers);
  expect(reclothedUsers[2].username)
    .toBe(username);
  expect(reclothedUsers[2].birthday.getTime())
    .toBe(time);
});

test('ObjectCodec passes errors correctly.', () => {
  const userCodec = new ObjectCodec({
    username: stringCodec,
    birthday: dateCodec,
  });

  const username = 'Pope John XII';
  const user1 = {
    username,
    // missing birthday
  };
  const user2 = {
    username,
    // birthday is of incorrect type
    birthday: gibberish,
  }

  expect(() => (userCodec.deserialize(user1)))
    .toThrow();
  expect(() => (userCodec.deserialize(user2)))
    .toThrow();
})

test('OptionalCodec serialize/deserializes correctly', () => {
  const userCodec = new ObjectCodec({
    username: stringCodec,
    birthday: new OptionalCodec(dateCodec),
  });
  const username = 'Pope John XII';

  const user1 = {
    username,
  };
  const unclothedUser1 = {
    username,
  };

  const user2 = {
    username,
    birthday: date,
  };
  const unclothedUser2 = {
    username,
    birthday: dateString,
  };
  const reclothedUser2 = userCodec.deserialize(unclothedUser2);

  expect(userCodec.serialize(user1)).toEqual(unclothedUser1);
  expect(userCodec.deserialize(unclothedUser1)).toEqual(user1);
  expect(userCodec.serialize(user2)).toEqual(unclothedUser2);
  expect(reclothedUser2.username).toBe(username);
  expect(reclothedUser2.birthday?.getTime()).toBe(time);
});

test('OptionalCodec should not introduce unecessary { key: undefined } entries', () => {
  const userCodec = new ObjectCodec({
    username: stringCodec,
    birthday: new OptionalCodec(dateCodec),
  });
  const username = 'Pope John XII';

  const user1 = {
    username,
  };
  const unclothedUser1 = {
    username,
  };

  expect('birthday' in userCodec.serialize(user1)).toBe(false);
  expect('birthday' in userCodec.deserialize(unclothedUser1)).toBe(false);
});
