import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "./testData";

type QueryParams = Record<string, string | number | boolean>;

/** REST client for the RWA API (bank accounts and future resources). */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  get bankAccountsPath() {
    return `${API_URL}/bankAccounts`;
  }

  get bankTransfersPath() {
    return `${API_URL}/bankTransfers`;
  }

  get commentsPath() {
    return `${API_URL}/comments`;
  }

  get contactsPath() {
    return `${API_URL}/contacts`;
  }

  get likesPath() {
    return `${API_URL}/likes`;
  }

  get notificationsPath() {
    return `${API_URL}/notifications`;
  }

  get transactionsPath() {
    return `${API_URL}/transactions`;
  }

  get usersPath() {
    return `${API_URL}/users`;
  }

  listBankAccounts() {
    return this.request.get(this.bankAccountsPath);
  }

  getBankAccount(id: string) {
    return this.request.get(`${this.bankAccountsPath}/${id}`);
  }

  createBankAccount(body: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  }) {
    return this.request.post(this.bankAccountsPath, { data: body });
  }

  deleteBankAccount(id: string) {
    return this.request.delete(`${this.bankAccountsPath}/${id}`);
  }

  listBankTransfers() {
    return this.request.get(this.bankTransfersPath);
  }

  listComments(transactionId: string) {
    return this.request.get(`${this.commentsPath}/${transactionId}`);
  }

  createComment(transactionId: string, body: { content: string }) {
    return this.request.post(`${this.commentsPath}/${transactionId}`, { data: body });
  }

  listContacts(username: string) {
    return this.request.get(`${this.contactsPath}/${username}`);
  }

  createContact(body: { contactUserId: string }) {
    return this.request.post(this.contactsPath, { data: body });
  }

  deleteContact(contactId: string) {
    return this.request.delete(`${this.contactsPath}/${contactId}`);
  }

  listLikes(transactionId: string) {
    return this.request.get(`${this.likesPath}/${transactionId}`);
  }

  createLike(transactionId: string, body: { transactionId: string }) {
    return this.request.post(`${this.likesPath}/${transactionId}`, { data: body });
  }

  listNotifications() {
    return this.request.get(this.notificationsPath);
  }

  createNotifications(body: { items: Record<string, unknown>[] }) {
    return this.request.post(`${this.notificationsPath}/bulk`, { data: body });
  }

  updateNotification(notificationId: string, body: Record<string, unknown>) {
    return this.request.patch(`${this.notificationsPath}/${notificationId}`, { data: body });
  }

  listTransactions(params?: QueryParams) {
    return this.request.get(this.transactionsPath, { params });
  }

  listContactTransactions(params?: QueryParams) {
    return this.request.get(`${this.transactionsPath}/contacts`, { params });
  }

  listPublicTransactions(params?: QueryParams) {
    return this.request.get(`${this.transactionsPath}/public`, { params });
  }

  createTransaction(body: Record<string, unknown>) {
    return this.request.post(this.transactionsPath, { data: body });
  }

  updateTransaction(transactionId: string, body: Record<string, unknown>) {
    return this.request.patch(`${this.transactionsPath}/${transactionId}`, { data: body });
  }

  listUsers() {
    return this.request.get(this.usersPath);
  }

  getUser(userId: string) {
    return this.request.get(`${this.usersPath}/${userId}`);
  }

  getUserProfile(username: string) {
    return this.request.get(`${this.usersPath}/profile/${username}`);
  }

  searchUsers(query: string) {
    return this.request.get(`${this.usersPath}/search`, { params: { q: query } });
  }

  createUser(body: Record<string, unknown>) {
    return this.request.post(this.usersPath, { data: body });
  }

  updateUser(userId: string, body: Record<string, unknown>) {
    return this.request.patch(`${this.usersPath}/${userId}`, { data: body });
  }
}
