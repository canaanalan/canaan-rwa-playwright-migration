import { omit } from "lodash/fp";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

const bankAccountsUrl = `http://localhost:${backendPort}/bankAccounts`;

export const bankAccountsMachine = dataMachine("bankAccounts").withConfig({
  services: {
    fetchData: async () => {
      const resp = await httpClient.get(bankAccountsUrl);
      return { results: resp.data.results, pageData: {} };
    },
    deleteData: async (_ctx, event: any) => {
      const { id } = omit("type", event);
      const resp = await httpClient.delete(`${bankAccountsUrl}/${id}`);
      return resp.data;
    },
    createData: async (_ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.post(bankAccountsUrl, payload);
      return resp.data;
    },
  },
});
