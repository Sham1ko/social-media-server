import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@smdb.bmoahlw.mongodb.net/?retryWrites=true&w=majority',
    ),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
