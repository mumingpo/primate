import p, { InferInternal, InferPrimitive, strict } from './index';

const stringCodec = strict.stringCodec;

const dateSerializer = (date: Date) => (date.toISOString());
const dateDeserializer = (unk: unknown) => {
  const date = new Date(`${unk}`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${unk} is not a valid date.`);
  }
  return date;
};
const dateCodec = p.primitive(dateSerializer, dateDeserializer, 'dateCodec');

const taskCodec = p.object({
  title: stringCodec,
  description: stringCodec,
  createdAt: dateCodec,
  updatedAt: dateCodec,
});
type Task = InferInternal<typeof taskCodec>;
type RawTask = InferPrimitive<typeof taskCodec>;

const userCodec = p.object({
  username: stringCodec,
  email: stringCodec,
  createdAt: dateCodec,
  updatedAt: dateCodec,
  tasks: p.array(taskCodec),
  petName: p.optional(stringCodec),
});
type User = InferInternal<typeof userCodec>;
type RawUser = InferPrimitive<typeof userCodec>;

const exampleTask: Task = {
  title: 'abcdef',
  description: 'Lorem ipsum dolorem sit amet.',
  createdAt: new Date('2000-01-01T00:00:00.000Z'),
  updatedAt: new Date('2020-01-01T00:00:00.000Z'),
  // chicken: 'bling', // should give error
};

const user: User = {
  username: 'abcdef',
  email: 'abcdef@ghi.jkl',
  createdAt: new Date('2000-01-01T00:00:00.000Z'),
  updatedAt: new Date('2020-01-01T00:00:00.000Z'),
  tasks: [
    exampleTask,
    exampleTask,
    exampleTask,
    {
      ...exampleTask,
      // chicken: 'bling', // should give error
    },
  ],
  petName: 'bling', // should be optional
  // chicken: 'aa', // should give error
};

const serializedUser = userCodec.serialize(user);
serializedUser.tasks[0].createdAt.charAt(0);  // should be able to run
// serializedUser.tasks[0].createdAt.getTime(); // should give error

const exampleRawTask: RawTask = {
  title: 'abcdef',
  description: 'Lorem ipsum dolorem sit amet.',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  // chicken: 'bling', // should give error
};

const rawUser: RawUser = {
  username: 'abcdef',
  email: 'abcdef@ghi.jkl',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  tasks: [
    exampleRawTask,
    exampleRawTask,
    exampleRawTask,
    {
      ...exampleRawTask,
      // chicken: 'bling', // should give error
    },
  ],
  petName: 'bling', // should be optional
  // chicken: 'aa', // should give error
}

const deserializedUser = userCodec.deserialize(rawUser);
deserializedUser.tasks[0].createdAt.getTime(); // should be able to run
// deserializedUser.tasks[0].createdAt.charAt(0); // should give error
