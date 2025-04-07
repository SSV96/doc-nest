import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { Documents } from './documents/entities/documents.entity';
import { Users } from './users/entities/user.entity';
import { RolesEnum } from './common/enum/roles.enum';
import { DocumentStatusEnum } from './documents/enum/document.status';
import dataSource from './common/postgres/data.source';

async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(Users);
  const documentRepository = dataSource.getRepository(Documents);

  const saltRounds = 10;

  const usersData = [
    { email: 'admin@example.com', role: RolesEnum.ADMIN },
    { email: 'editor@example.com', role: RolesEnum.EDITOR },
    { email: 'viewer1@example.com', role: RolesEnum.VIEWER },
    { email: 'viewer2@example.com', role: RolesEnum.VIEWER },
    { email: 'editor2@example.com', role: RolesEnum.EDITOR },
  ];

  const createdUsers: Users[] = [];

  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.email, saltRounds);
    const user = userRepository.create({
      id: uuidv4(),
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    });
    const savedUser = await userRepository.save(user);
    createdUsers.push(savedUser);
  }

  const documentsData = [];
  createdUsers.pop(); // exclude last user from having documents (for LEFT JOIN demo)

  for (let i = 0; i < 20; i++) {
    documentsData.push({
      id: uuidv4(),
      title: faker.lorem.sentence(),
      uploadedBy:
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      url: faker.internet.url(),
      metaInfo: {
        originalName: faker.system.fileName(),
        mimeType: 'application/pdf',
        size: faker.number.int({ min: 10000, max: 5000000 }),
        encoding: '7bit',
        fieldName: 'file',
      },
      status: faker.helpers.enumValue(DocumentStatusEnum),
    });
  }

  for (const documentData of documentsData) {
    const document = documentRepository.create(documentData);
    await documentRepository.save(document);
  }

  console.log('✅ Database seeded successfully.\n');
}

async function runJoinQueries(dataSource: DataSource) {
  console.log('🔍 Running JOIN queries:\n');

  // INNER JOIN: Users who uploaded documents
  const innerJoin = await dataSource.query(`
    SELECT u.email, d.title
    FROM users u
    INNER JOIN documents d ON u.id = d."uploadedBy"::uuid
  `);
  console.log('📌 INNER JOIN (users with documents):');
  console.table(innerJoin);

  // LEFT JOIN: All users (even those without documents)
  const leftJoin = await dataSource.query(`
    SELECT u.email, d.title
    FROM users u
    LEFT JOIN documents d ON u.id = d."uploadedBy"::uuid
  `);
  console.log('📌 LEFT JOIN (all users, with or without documents):');
  console.table(leftJoin);

  // RIGHT JOIN: All documents (even if uploader is missing)
  const rightJoin = await dataSource.query(`
    SELECT d.title, u.email
    FROM users u
    RIGHT JOIN documents d ON u.id = d."uploadedBy"::uuid
  `);
  console.log('📌 RIGHT JOIN (all documents, some may have missing users):');
  console.table(rightJoin);

  // FULL OUTER JOIN
  const fullJoin = await dataSource.query(`
    SELECT u.email, d.title
    FROM users u
    FULL JOIN documents d ON u.id = d."uploadedBy"::uuid
  `);
  console.log('📌 FULL JOIN (all users + all documents):');
  console.table(fullJoin);
}

export async function runSeed(dataSource: DataSource) {
  try {
    await seedDatabase(dataSource);
    await runJoinQueries(dataSource);
  } catch (error) {
    console.error('❌ Error during seeding or queries:', error);
  }
}

dataSource
  .initialize()
  .then(async () => {
    await runSeed(dataSource);
    await dataSource.destroy();
  })
  .catch((error) => {
    console.error('❌ Error initializing data source:', error);
  });
