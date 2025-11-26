import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { StyleModule } from '../style/style.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [StyleModule, SubscriptionsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}

