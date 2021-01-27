import express from "express";
import dotenv from "dotenv";
import * as routes from "./cryptoCurrency/routes/route";
import { connect, set as mongooseSet } from 'mongoose';
import { schedule } from 'node-cron';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { ICryptoCurrency, CryptoCurrencyRepository } from "./cryptoCurrency/Model/CryptoCurrency";
import { Binance } from "./binanceRepository";

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

routes.register(app);

app.listen(port, async () => {
    if (process.env.MONGODB_CONNECTION_STRING) {
        try {
            await connect(process.env.MONGODB_CONNECTION_STRING, {
                useNewUrlParser: true,
                useFindAndModify: false,
                useCreateIndex: true,
                useUnifiedTopology: true,
                poolSize: 5
            });
            console.info('connected to db!')
        } catch (error) {
            console.error(error, '!!!CRITICAL ERROR!!!. cannot Connect to mongodb.');
        }

    } else {
        console.error('!!!CRITICAL ERROR!!!. cannot Connect to mongodb. check the MONGODB_CONNECTION_STRING in .env.');
    }

    console.log(`server started at http://localhost:${port}`);
});

// scheduled job for getting the crypto currencies form binance every 5 min
schedule('*/5 * * * *', () => {
    console.info(`starting cron-job`)
    Binance.getMarketData().then((result: ICryptoCurrency[]) => {
        console.info(`cronJobError data fetched`)
        CryptoCurrencyRepository.bulkUpsert(result).then(() => {
            console.info(`cronJobError data saved`)
        }).catch(e => console.error('cronJobError data could not saved', e));
    }).catch(e => console.error('cronJobError data could not fetched', e));
});