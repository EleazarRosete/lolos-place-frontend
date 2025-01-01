import React, { useState, useEffect } from "react";
import styles from "./Feedback.module.css";
import Comment from "./Comment/Comment";

function Feedback() {
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterSentiment, setFilterSentiment] = useState("all");

    const getComments = async () => {
        try {
            const response = await fetch("http://localhost:5000/feedback/get-comment", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            console.log("Fetched Comments:", jsonData);
            setComments(jsonData);
            setFilteredComments(jsonData); // Initially, show all comments
        } catch (err) {
            console.error("Error fetching comments:", err.message);
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    const sortById = () => {
        const sortedComments = [...filteredComments].sort((a, b) => {
            return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
        });
        setFilteredComments(sortedComments);
        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    };

    const filterBySentiment = (sentiment) => {
        if (sentiment === "all") {
            setFilteredComments(comments);
        } else {
            const filtered = comments.filter((c) => c.sentiment === sentiment);
            setFilteredComments(filtered);
        }
        setFilterSentiment(sentiment);
    };

    return (
        <section className={styles.section}>
            <header className={styles.feedback}>
                <h1 className={styles.textStyle1}>List of All Feedbacks</h1>
                <div className={styles.controls}>
                    <button className={styles.sort} onClick={sortById}>
                        Sort by ID ({sortOrder === "desc" ? "Newest First" : "Oldest First"})
                    </button>
                    <select
                        className={styles.filter}
                        value={filterSentiment}
                        onChange={(e) => filterBySentiment(e.target.value)}
                    >
                        <option value="all">All Sentiments</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                    </select>
                </div>
            </header>
            <div className={styles.feedbackContainer}>
                {filteredComments.length > 0 ? (
                    filteredComments.map((c, index) => (
                        <Comment
                            key={index} // Use index as a key for mapping
                            username={c.name}
                            comment={c.comment}
                            date={c.date}
                            sentiment={c.sentiment}
                        />
                    ))
                ) : (
                    <p className={styles.textStyle1}>No comments available.</p>
                )}
            </div>
        </section>
    );
}

export default Feedback;
