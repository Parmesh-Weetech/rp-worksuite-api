import { BaseEntity } from 'src/app/common/entities/base.entity';
import { Column, Entity, Generated } from 'typeorm';

@Entity('employees')
export class Employee extends BaseEntity {
  @Column({
    type: 'bigint',
    nullable: false,
    unique: true,
  })
  @Generated('increment')
  employeeId: number;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false,
  })
  middleName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  lastName: string;

  @Column({
    type: 'integer',
    nullable: false,
    unique: false,
  })
  phoneNumber: number;

  @Column({
    type: 'integer',
    nullable: false,
    unique: false,
  })
  fatherMobileNumber: number;

  @Column({
    type: 'integer',
    nullable: false,
    unique: false,
  })
  motherMobileNumber: number;

  @Column({
    type: 'integer',
    nullable: false,
    unique: false,
  })
  alternateMobileNumber: number;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  countryCode: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false,
  })
  alternateEmail: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  address: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  city: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  state: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  country: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  zipCode: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  gender: string;

  @Column({
    type: 'date',
    nullable: false,
    unique: false,
  })
  dateOfBirth: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  aadharNumber: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  panNumber: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  bankAccountNumber: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  bankIFSCCode: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  bankAccountHolderName: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false,
  })
  profilePhoto: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: false,
  })
  signature: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: false,
  })
  status: string;
}
