import { useState, FormEvent } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
} from "@mui/material";
import * as api from "../api";

const Feedback = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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
            setError(err.message || "Failed to submit feedback.");
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
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
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
