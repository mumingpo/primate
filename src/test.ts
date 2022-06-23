import p from './index';
import type {
  PJSO,
  InferInternal,
  InferPrimitive,
} from './index';

const stringCodec = p.primitive<string, string>(
  (s: string) => (s),
  (unk: unknown) => (`${unk}`),
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

type Task = {
  title: string,
  description: string,
  createdAt: Date,
  updatedAt: Date,
};

type RawTask = {
  title: string,
  description: string,
  createdAt: string,
  updatedAt: string,
};

type User = {
  username: string,
  email: string,
  createdAt: Date,
  updatedAt: Date,
  tasks: Array<Task>,
};

type RawUser = {
  username: string,
  email: string,
  createdAt: string,
  updatedAt: string,
  tasks: Array<RawTask>,
};

const taskCodec = p.object({
  title: stringCodec,
  description: stringCodec,
  createdAt: dateCodec,
  updatedAt: dateCodec,
});

const userCodecSchema = {
  username: stringCodec,
  email: stringCodec,
  createdAt: dateCodec,
  updatedAt: dateCodec,
  tasks: p.array(taskCodec),
};

const userCodec = p.object(userCodecSchema);

const exampleTask: Task = {
  title: 'abcdef',
  description: 'Lorem ipsum dolorem sit amet.',
  createdAt: new Date('2000-01-01T00:00:00.000Z'),
  updatedAt: new Date('2020-01-01T00:00:00.000Z'),
};

const user: User = {
  username: 'abcdef',
  email: 'abcdef@ghi.jkl',
  createdAt: new Date('2000-01-01T00:00:00.000Z'),
  updatedAt: new Date('2020-01-01T00:00:00.000Z'),
  tasks: [exampleTask, exampleTask, exampleTask],
};

const serializedUser: InferPrimitive<typeof userCodecSchema> = userCodec.serialize(user);
serializedUser.tasks[0].createdAt.charAt(0);

const exampleRawTask: RawTask = {
  title: 'abcdef',
  description: 'Lorem ipsum dolorem sit amet.',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

const rawUser: RawUser = {
  username: 'abcdef',
  email: 'abcdef@ghi.jkl',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  tasks: [exampleRawTask, exampleRawTask, exampleRawTask]
}

const deserializedUser: InferInternal<typeof userCodecSchema> = userCodec.deserialize(rawUser);
deserializedUser.tasks[0].createdAt.getTime();
