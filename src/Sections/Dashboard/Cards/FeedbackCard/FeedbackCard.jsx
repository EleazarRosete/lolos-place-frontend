import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import styles from './FeedbackCard.module.css';
import Feedback from '../../../Feedback/Feedback';

function FeedbackCard() { 
    const navigate = useNavigate();
    const [latestComment, setLatestComment] = useState("");
    const [sentiment, setCommentSentiment] = useState("");

    const getComments = async () => {
        try {
            const response = await fetch("https://lolos-place-backend.onrender.com/feedback/get-comment", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const jsonData = await response.json();

            if (jsonData.length === 0) {
                setLatestComment("");
                setCommentSentiment("");
                return;
            }

            // Sort comments by ID in descending order (newest first)
            const sortedComments = jsonData.sort((a, b) => b.id - a.id);

            // Get the latest comment and sentiment
            const lastComment = sortedComments[0].comment || "";
            const commentSentiment = sortedComments[0].sentiment || "";

            setLatestComment(lastComment);
            setCommentSentiment(commentSentiment);
        } catch (err) {
            console.error("Error fetching comments:", err.message);
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    // Determine the background class based on sentiment
    const getSentimentClass = () => {
        if (sentiment === "positive") {
            return styles.positive;
        } else if (sentiment === "negative") {
            return styles.negative;
        } else if (sentiment === "neutral") {
            return styles.neutral;
        }
        return styles.default; // Default (no sentiment)
    };

    return (
        <div className={styles.FeedbackCard}>
            <h1 className={styles.FeedbackCardHeaderTxt}>Latest Feedback:</h1>
            <button className={`${styles.commentBox} ${getSentimentClass()}`}            onClick={() => navigate('/admin/feedback')} >
                {latestComment || "No comments available."}
            </button>
            <Routes>
                    <Route path="/admin/feedback" element={<Feedback />} />
                </Routes>
        </div>
        
    );
}

export default FeedbackCard;
