import express, { NextFunction, Request, Response } from "express";
import Feedback from "../models/Feedback";
import auth from "../middleware/auth";
import { HttpError } from "../utils/HttpError";
import { IUser } from "../models/User";
import { validateRequest } from "../middleware/validateRequest";
import { feedbackCreateValidation } from "../middleware/validators";

const router = express.Router();

interface AuthRequest extends Request {
    user?: IUser;
}

router.post(
    "/",
    auth,
    feedbackCreateValidation,
    validateRequest,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new HttpError(401, "Authentication required");
            }
            const { name, email, message } = req.body;
            const feedback = await Feedback.create({ name, email, message });
            res.status(201).json(feedback);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
