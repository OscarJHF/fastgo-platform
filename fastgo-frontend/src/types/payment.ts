export interface Pago {
  id: number;
  pedidoId: number;
  metodo: string;
  estado: string;
  referencia: string;
  fechaPago?: string;
}

export interface WompiAcceptanceResponse {
  acceptanceToken?: string;
  personalDataAuthToken?: string;
  permalink?: string;
}

export interface WompiBank {
  financial_institution_code: string;
  financial_institution_name: string;
}

export interface WompiPaymentRequest {
  pedidoId: number;
  method: 'NEQUI' | 'PSE';
  acceptanceToken?: string;
  personalDataAuthToken?: string;
  nequiPhone?: string;
  pseUserType?: number;
  pseLegalIdType?: string;
  pseLegalId?: string;
  pseFinancialInstitutionCode?: string;
  bankPaymentDescription?: string;
}
