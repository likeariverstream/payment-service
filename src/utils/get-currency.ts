import { RUB, USD } from 'dinero.js';

const currencies = {
  [RUB.code]: RUB,
  [USD.code]: USD,
};

export const getCurrency = (currency: keyof typeof currencies) => {
  return currencies[currency];
};
