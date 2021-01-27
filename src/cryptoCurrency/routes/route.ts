import { Request, Response, Application, } from "express";
import { Binance } from "../../binanceRepository";
import { ICryptoCurrency, CryptoCurrencyRepository } from "../Model/CryptoCurrency";

type CryptoCurrencyResult = {
    _id: string,
    symbol: string,
    estimatedSettlePrice: string,
    indexPrice: string,
    interestRate: string,
    lastFundingRate: string,
    markPrice: string,
    priceInIRR: string | null
    nextFundingTime: number,
    time: number
};

export const register = (app: Application) => {
    app.get("/binance/crypto-currency", async (req: Request, res: Response) => {
        try {
            if (!req.query.symbol) {
                let symbols: ICryptoCurrency[] = await Binance.getMarketData();
                await CryptoCurrencyRepository.bulkUpsert(symbols);

            };
            let symbolData = await Binance.getSymbolData(req.query.symbol as string);
            await CryptoCurrencyRepository.upsert(symbolData);
            return res.send(symbolData);
        } catch (error) {
            if (error.isAxiosError) {
                res.status(error.response.status).send(error.response.data.msg);
                return;
            }
            res.status(500).send({ msg: "Internal Server Error" });
        }
    });

    app.get("/crypto-currency", async (req: Request, res: Response) => {
        try {
            let symbol = req.query.symbol as string | undefined;
            let cryptoCurrencies = await CryptoCurrencyRepository.findBySymbol(symbol);
            if (!cryptoCurrencies) {
                return res.status(404).send({ msg: "CryptoCurrency Not Found" });
            }
            let RialPrice = await CryptoCurrencyRepository.getRialPrice();
            let result: CryptoCurrencyResult[] = cryptoCurrencies.map(cryptoCurrency => {
                let priceInIRR: string | null = null;
                if (RialPrice) {
                    priceInIRR = `${parseFloat(RialPrice.markPrice) * parseFloat(cryptoCurrency.markPrice)}`
                }
                return {
                    _id: cryptoCurrency._id,
                    symbol: cryptoCurrency.symbol,
                    estimatedSettlePrice: cryptoCurrency.estimatedSettlePrice,
                    indexPrice: cryptoCurrency.indexPrice,
                    interestRate: cryptoCurrency.interestRate,
                    lastFundingRate: cryptoCurrency.lastFundingRate,
                    markPrice: cryptoCurrency.markPrice,
                    priceInIRR,
                    nextFundingTime: cryptoCurrency.nextFundingTime,
                    time: cryptoCurrency.nextFundingTime
                };
            });
            res.send(result);
        } catch (error) {
            res.status(500).send({ msg: "Internal Server Error" });
        }
    });

    app.put("/rial", async (req: Request, res: Response) => {
        if (!req.body.price || typeof req.body.price !== 'number') {
            res.status(400).send({ msg: "Request Body is not valid" });
        };
        let rialPrice = await CryptoCurrencyRepository.setRialPrice(req.body.price);
        res.json(rialPrice)
    });
};

