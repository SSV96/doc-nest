import { DataSource } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { Documents } from './documents/entities/documents.entity';
import { User } from './users/entities/user.entity';
import { RolesEnum } from './common/enum/roles.enum';
import { DocumentStatusEnum } from './documents/enum/document.status';
import dataSource from './common/postgres/data.source';
async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const documentRepository = dataSource.getRepository(Documents);

  const saltRounds = 10;

  const usersData = [
    { email: 'admin@example.com', role: RolesEnum.ADMIN },
    { email: 'editor@example.com', role: RolesEnum.EDITOR },
    { email: 'viewer1@example.com', role: RolesEnum.VIEWER },
    { email: 'viewer2@example.com', role: RolesEnum.VIEWER },
    { email: 'editor2@example.com', role: RolesEnum.EDITOR },
  ];

  const createdUsers: User[] = [];

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
  for (let i = 0; i < 20; i++) {
    documentsData.push({
      id: uuidv4(),
      title: faker.lorem.sentence(),
      uploadedBy:
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      url: faker.internet.url(),
      status: faker.helpers.enumValue(DocumentStatusEnum),
    });
  }

  for (const documentData of documentsData) {
    const document = documentRepository.create(documentData);
    await documentRepository.save(document);
  }

  console.log('Database seeded successfully.');
}

export async function runSeed(dataSource: DataSource) {
  try {
    await seedDatabase(dataSource);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

dataSource
  .initialize()
  .then(async () => {
    await runSeed(dataSource);
    await dataSource.destroy();
  })
  .catch((error) => {
    console.error('Error initializing data source:', error);
  });
