import styles from './Comment.module.css';

function Comment({ username, comment, date, sentiment }) {
    const sentimentColor = () => {
        if (sentiment.toLowerCase() === 'positive') return '#6ff56e'; // Brighter and more saturated green
        if (sentiment.toLowerCase() === 'negative') return '#ff5b5b'; // Brighter and more saturated red
        if (sentiment.toLowerCase() === 'neutral') return '#b0b0b0'; // More saturated neutral grey
        return '#f2f2f2'; // Slightly brighter white-grey for undefined
    };
    
    

    // Format the date to "Nov 29, 2024 Friday"
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
        const formattedDate = new Date(date).toLocaleDateString('en-US', options);
        return formattedDate;
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
            <p
                className={styles.sentimentStyle}
                style={{ color: sentimentColor() }}
            >
                {sentiment}
            </p>
        </div>
    );
}

export default Comment;
