import type { APIRequestContext } from "@playwright/test";

import { BankAccountsApi } from "./api/bankAccountsApi";
import { BankTransfersApi } from "./api/bankTransfersApi";
import { CommentsApi } from "./api/commentsApi";
import { ContactsApi } from "./api/contactsApi";
import { HealthApi } from "./api/healthApi";
import { LikesApi } from "./api/likesApi";
import { NotificationsApi } from "./api/notificationsApi";
import { TransactionsApi } from "./api/transactionsApi";
import { UsersApi } from "./api/usersApi";

/** Composition root for RWA API resource clients used by Playwright specs. */
export class ApiClient {
  readonly bankAccounts: BankAccountsApi;
  readonly bankTransfers: BankTransfersApi;
  readonly comments: CommentsApi;
  readonly contacts: ContactsApi;
  readonly health: HealthApi;
  readonly likes: LikesApi;
  readonly notifications: NotificationsApi;
  readonly transactions: TransactionsApi;
  readonly users: UsersApi;

  constructor(request: APIRequestContext) {
    this.bankAccounts = new BankAccountsApi(request);
    this.bankTransfers = new BankTransfersApi(request);
    this.comments = new CommentsApi(request);
    this.contacts = new ContactsApi(request);
    this.health = new HealthApi(request);
    this.likes = new LikesApi(request);
    this.notifications = new NotificationsApi(request);
    this.transactions = new TransactionsApi(request);
    this.users = new UsersApi(request);
  }
}
