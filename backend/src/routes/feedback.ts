import express, { Request } from "express";
import Feedback from "../models/Feedback";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { HttpError } from "../utils/HttpError";
import { IUser } from "../models/User";

const router = express.Router();

interface AuthRequest extends Request {
    user?: IUser;
}

router.post(
    "/",
    [
        auth,
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Email is invalid"),
        body("message").notEmpty().withMessage("Message is required"),
    ],
    async (req: AuthRequest, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new HttpError(400, "Validation failed", errors.array()));
        }

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
