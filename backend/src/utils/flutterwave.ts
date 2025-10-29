import axios from "axios";

interface InitializePaymentData {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_options?: string;
  customer: {
    email: string;
    phonenumber?: string;
    name: string;
  };
  customizations: {
    title: string;
    description?: string;
    logo?: string;
  };
  meta?: {
    orderId?: string;
    shopId?: string;
  };
}

interface VerifyPaymentResponse {
  status: "successful" | "failed";
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
}

class FlutterwaveService {
  private baseURL = "https://api.flutterwave.com/v3";
  private secretKey: string;
  private publicKey: string;

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY!;
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY!;

    if (!this.secretKey || !this.publicKey) {
      throw new Error("Flutterwave keys not configured");
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async initializePayment(data: InitializePaymentData): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/payments`, data, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Initialize Payment Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Payment initialization failed"
      );
    }
  }

  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/verify`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Verify Payment Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Payment verification failed"
      );
    }
  }

  async createEscrow(data: {
    tx_ref: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      name: string;
    };
    seller: {
      email: string;
      name: string;
    };
    title: string;
    description: string;
  }): Promise<any> {
    try {
      const escrowData = {
        tx_ref: data.tx_ref,
        amount: data.amount,
        currency: data.currency,
        customer: {
          email: data.customer.email,
          name: data.customer.name,
        },
        merchant: {
          email: data.seller.email,
          name: data.seller.name,
        },
        title: data.title,
        description: data.description,
        callback_url: `${process.env.API_BASE_URL}/api/payments/escrow-callback`,
      };

      const response = await axios.post(`${this.baseURL}/escrows`, escrowData, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Create Escrow Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Escrow creation failed"
      );
    }
  }

  async releaseEscrow(escrowId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/escrows/${escrowId}/disburse`,
        {},
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Release Escrow Error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Escrow release failed");
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    try {
      const refundData: any = {};
      if (amount) {
        refundData.amount = amount;
      }

      const response = await axios.post(
        `${this.baseURL}/transactions/${transactionId}/refund`,
        refundData,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Refund Error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Refund failed");
    }
  }

  async createTransfer(data: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration: string;
    currency: string;
    beneficiary_name: string;
  }): Promise<any> {
    try {
      const transferData = {
        ...data,
        reference: `TJS_TRANSFER_${Date.now()}`,
        callback_url: `${process.env.API_BASE_URL}/api/payments/transfer-callback`,
        debit_currency: data.currency,
      };

      const response = await axios.post(
        `${this.baseURL}/transfers`,
        transferData,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Transfer Error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Transfer failed");
    }
  }

  async getBanks(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/banks/NG`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Get Banks Error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Failed to get banks");
    }
  }

  async verifyAccount(accountNumber: string, bankCode: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/accounts/resolve`,
        {
          account_number: accountNumber,
          account_bank: bankCode,
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Flutterwave Verify Account Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Account verification failed"
      );
    }
  }

  generatePaymentHash(data: any): string {
    // This would generate a hash for webhook verification
    // Implementation depends on Flutterwave's specific requirements
    return "";
  }

  verifyWebhookSignature(signature: string, payload: any): boolean {
    // Implement webhook signature verification
    // This ensures the webhook is actually from Flutterwave
    const hash = this.generatePaymentHash(payload);
    return hash === signature;
  }
}

export const flutterwaveService = new FlutterwaveService();



