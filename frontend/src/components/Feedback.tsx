import { useState } from "react";
import type { FormEvent } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
} from "@mui/material";
import * as api from "../api";
import { INPUT_LIMITS } from "../constants/inputLimits";

const Feedback = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const extractErrorMessage = (err: any) => {
        const data = err?.response?.data;
        if (data?.message) {
            if (Array.isArray(data?.data)) {
                const details = data.data.map((e: any) => e.msg || e.message).join(", ");
                return details ? `${data.message}: ${details}` : data.message;
            }
            return data.message;
        }
        if (Array.isArray(data?.errors)) {
            return data.errors.map((e: any) => e.msg || e.message).join(", ");
        }
        if (err?.message) {
            return err.message;
        }
        return "Failed to submit feedback.";
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        try {
            await api.submitFeedback({ name, email, message });
            setSuccess(true);
            setName("");
            setEmail("");
            setMessage("");
        } catch (err: any) {
            setError(extractErrorMessage(err));
        }
    };

    return (
        <Container maxWidth="sm">
            <Box my={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Submit Feedback
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ maxLength: INPUT_LIMITS.feedbackName }}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ maxLength: INPUT_LIMITS.feedbackEmail }}
                    />
                    <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        multiline
                        rows={4}
                        inputProps={{ maxLength: INPUT_LIMITS.feedbackMessage }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Submit
                    </Button>
                </form>
                {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Thank you for your feedback!
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Container>
    );
};

export default Feedback;
