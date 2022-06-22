import p from './index';
import type { PJSO } from './index';

const identity = p.primitive(
  (obj: PJSO) => (obj),
  (obj: PJSO) => (obj),
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

const dateCodec = p.primitive(
  (date: Date) => (date.toISOString()),
  (isoString: string) => (new Date(isoString)),
);

const taskCodec = p.object({
  title: identity,
  description: identity,
  createdAt: dateCodec,
  updatedAt: dateCodec,
});

const userCodecSchema = {
  username: identity,
  email: identity,
  createdAt: dateCodec,
  updatedAt: dateCodec,
  tasks: p.array(taskCodec),
};

const userCodec = p.object(userCodecSchema);

const exampleTask = {
  title: 'abcdef',
  description: 'Lorem ipsum dolorem sit amet.',
  createdAt: new Date('2000-01-01T00:00:00.000Z'),
  updatedAt: new Date('2020-01-01T00:00:00.000Z'),
};

const user = {
  username: 'abcdef',
  email: 'abcdef@ghi.jkl',
  createdAt: new Date('2000-01-01T00:00:00.000Z'),
  updatedAt: new Date('2020-01-01T00:00:00.000Z'),
  tasks: [exampleTask, exampleTask, exampleTask],
};

const serializedUser = userCodec.serialize(user);
serializedUser.tasks[0].createdAt.charAt(0);

const exampleRawTask = {
  title: 'abcdef',
  description: 'Lorem ipsum dolorem sit amet.',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

const rawUser = {
  username: 'abcdef',
  email: 'abcdef@ghi.jkl',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  tasks: [exampleRawTask, exampleRawTask, exampleRawTask]
}

const deserializedUser = userCodec.deserialize(rawUser);
deserializedUser.tasks[0].createdAt.getTime();
