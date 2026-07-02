import { CardNetwork, CardType, CardStatus } from './enums';

export interface CardRequest {
  accountId: number;
  cardNetwork: CardNetwork;
  cardType: CardType;
  pin: string;
  dailyLimit: number;
  monthlyLimit: number;
}

export interface CardResponse {
  cardId: number;
  cardNumber: string;
  cardHolderName: string;
  cardNetwork: CardNetwork;
  cardType: CardType;
  status: CardStatus;
  cvv: string;
  expiryDate: string;
  dailyLimit: number;
  monthlyLimit: number;
  accountNumber: string;
  internationalEnabled: boolean;
  onlineTransactionEnabled: boolean;
}