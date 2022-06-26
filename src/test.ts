import p, { InferInternal, InferPrimitive } from './index';

const stringCodec = p.primitive<string, string>(
  (s: string) => (s),
  (unk: unknown) => (unk ? `${unk}` : ''),
);

const dateCodec = p.primitive<Date, string>(
  (date: Date) => (date.toISOString()),
  (unk: unknown) => {
    const date = new Date(`${unk}`);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`${unk} is not a valid date.`);
    }
    return date;
  },
);

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
};

const serializedUser: InferPrimitive<typeof userCodec> = userCodec.serialize(user);
serializedUser.tasks[0].createdAt.charAt(0);
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
  ]
}

const deserializedUser: InferInternal<typeof userCodec> = userCodec.deserialize(rawUser);
deserializedUser.tasks[0].createdAt.getTime();
// deserializedUser.tasks[0].createdAt.charAt(0); // should give error
