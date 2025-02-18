import styles from './Comment.module.css';

function Comment({ username, comment, date, sentiment, ratings }) {
    const sentimentColor = () => {
        if (sentiment.toLowerCase() === 'positive') return '#6ff56e'; 
        if (sentiment.toLowerCase() === 'negative') return '#ff5b5b'; 
        if (sentiment.toLowerCase() === 'neutral') return '#b0b0b0'; 
        return '#f2f2f2';
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
        const formattedDate = new Date(date).toLocaleDateString('en-US', options);
        const formattedTime = new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} at ${formattedTime}`;
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={i < rating ? styles.filledStar : styles.emptyStar}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div className={styles.commentContainer}>
            <div className={styles.header}>
                <h1 className={styles.usernameStyle}>{username}</h1>
                <p className={styles.dateStyle}>{formatDate(date)}</p>
            </div>
            <div className={styles.txtBox}>
                <p className={styles.txtStyle}>{comment}</p>
            </div>
            <div className={styles.ratings}>
                <div>
                    <strong>Rating:</strong> {renderStars(ratings.rating)}
                </div>
                <div>
                    <strong>Quality:</strong> {renderStars(ratings.quality)}
                </div>
                <div>
                    <strong>Service:</strong> {renderStars(ratings.service)}
                </div>
            </div>
            <p className={styles.sentimentStyle} style={{ color: sentimentColor() }}>
                {sentiment}
            </p>
        </div>
    );
}

export default Comment;
