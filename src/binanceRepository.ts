import axios from 'axios';
import { ICryptoCurrency } from './cryptoCurrency/Model/CryptoCurrency';

export class Binance {
    private static async requestToBinance(params?: { symbol: string }) {
        let result = await axios.get(`${process.env.BINANCE_BASE_URL}/fapi/v1/premiumIndex`, {
            params
        });
        return result;
    };

    public static async getMarketData(): Promise<ICryptoCurrency[]> {
        let result = await this.requestToBinance();
        return result.data as ICryptoCurrency[];
    };

    public static async getSymbolData(symbol: string): Promise<ICryptoCurrency> {
        let result = await this.requestToBinance({ symbol });
        return result.data as ICryptoCurrency;
    };
}