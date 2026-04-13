import express from 'express';
import { sslSuccess, sslFail, sslCancel } from '../controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post('/success', sslSuccess);
paymentRouter.get('/success', sslSuccess);
paymentRouter.post('/fail', sslFail);
paymentRouter.get('/fail', sslFail);
paymentRouter.post('/cancel', sslCancel);
paymentRouter.get('/cancel', sslCancel);

export default paymentRouter;
