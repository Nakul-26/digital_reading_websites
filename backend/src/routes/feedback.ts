import express from "express";
import Feedback from "../models/Feedback";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.post(
    "/",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Email is invalid"),
        body("message").notEmpty().withMessage("Message is required"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, message } = req.body;
            const feedback = await Feedback.create({ name, email, message });
            res.status(201).json(feedback);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
