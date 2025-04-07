import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DocumentStatusEnum } from '../enum/document.status';
import { IFileMetaInfo } from '../interface';
@Entity()
export class Documents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Index()
  @Column()
  uploadedBy: string;

  @Column()
  url: string;

  @Column({ enum: DocumentStatusEnum })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metaInfo: IFileMetaInfo;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
