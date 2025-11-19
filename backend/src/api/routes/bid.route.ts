import { Router } from 'express';
import * as bidController from "../controllers/bid.controller";
import { validate } from '../../middlewares/validate.middleware';
import { placeBidSchema } from '../schemas/bid.schema';

const router = Router({ mergeParams: true });

router.get("",
    bidController.getHighestBidById
);

router.post("",
    validate(placeBidSchema, 'body'), 
    bidController.placeBid
);

router.get("/history",
    bidController.getBidHistoryById
);

export default router;