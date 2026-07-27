import { Module } from '@nestjs/common';
import { EmployeeService } from './services/employee.service';
import { EmployeeController } from '../rest/controllers/employee.controller';

@Module({
  providers: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
