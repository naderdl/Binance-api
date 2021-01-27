import { Document, model, Schema } from 'mongoose'

export interface ICryptoCurrency {
    symbol: string,
    markPrice: string,
    indexPrice: string,
    estimatedSettlePrice: string,
    lastFundingRate: string,
    interestRate: string,
    nextFundingTime: number,
    time: number
};

const CryptoCurrencySchema = new Schema({
    symbol: { type: String, index: true, unique: true },
    markPrice: String,
    indexPrice: String,
    estimatedSettlePrice: String,
    lastFundingRate: String,
    interestRate: String,
    nextFundingTime: Number,
    time: Number
});

interface ICryptoCurrencyDoc extends ICryptoCurrency, Document { };

export const CryptoCurrencyModel = model<ICryptoCurrencyDoc>('CryptoCurrency', CryptoCurrencySchema);

export class CryptoCurrencyRepository {
    static async bulkUpsert(cryptoCurrencies: ICryptoCurrency[]) {
        let docs = cryptoCurrencies.map(cryptoCurrency => {
            {
                return {
                    updateOne: {
                        filter: {
                            symbol: cryptoCurrency.symbol
                        },
                        update: cryptoCurrency,
                        upsert: true
                    }
                };
            }
        });
        let result = await CryptoCurrencyModel.bulkWrite(docs);
        return result;
    }

    public static async upsert(cryptoCurrency: ICryptoCurrency) {
        let result = await CryptoCurrencyModel.updateOne({
            symbol: cryptoCurrency.symbol
        }, cryptoCurrency, {
            upsert: true,
            new: true
        });
        return result;
    }

    public static async findBySymbol(symbol?: string): Promise<ICryptoCurrencyDoc[]> {
        let query = {};
        if (symbol) {
            query = { "symbol": { $regex: `.*${symbol}.*` } };
        };
        let result = await CryptoCurrencyModel.find(query);
        return result;
    }

    public static async setRialPrice(price: number): Promise<ICryptoCurrencyDoc> {
        let result = await CryptoCurrencyModel.findOneAndUpdate(
            { symbol: 'IRRUSDT' },
            {
                symbol: 'IRRUSDT',
                markPrice: `${price}`,
                time: Date.now()
            }, {
            upsert: true,
            new: true
        });
        return result;
    }

    public static async getRialPrice(): Promise<ICryptoCurrencyDoc | null> {
        let result = await CryptoCurrencyModel.findOne({
            symbol: 'IRRUSDT',
        });
        return result;
    }


}