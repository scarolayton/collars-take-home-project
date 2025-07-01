import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
