import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { appConfigValidationSchema } from './config/config';
import { AuthModule } from './modules/auth/auth.module';
import { AzureModule } from './modules/azure/azure.module';
import { BlobStorageModule } from './modules/blob-storage/blob-storage.module';
import { ChatModule } from './modules/chat/chat.module';
import { CognitiveSearchModule } from './modules/cognitive-search/cognitive-search.module';
import { OpenAiModule } from './modules/openai/openai.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      validationSchema: appConfigValidationSchema,
    }),
    TerminusModule,
    AuthModule,
    UsersModule,
    ChatModule,
    AzureModule,
    OpenAiModule,
    CognitiveSearchModule,
    BlobStorageModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
