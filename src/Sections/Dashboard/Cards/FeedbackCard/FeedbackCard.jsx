import React, { useState, useEffect } from "react";
import styles from './FeedbackCard.module.css';

function FeedbackCard() { 
    const [latestComment, setLatestComment] = useState("");
    const [sentiment, setCommentSentiment] = useState("");

    const getComments = async () => {
        try {
            const response = await fetch("http://localhost:5000/feedback/get-comment", {
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
        <div className={styles.card}>
            <h1 className={styles.cardHeaderTxt}>Latest Feedback:</h1>
            <div className={`${styles.commentBox} ${getSentimentClass()}`}>
                {latestComment || "No comments available."}
            </div>
        </div>
    );
}

export default FeedbackCard;
