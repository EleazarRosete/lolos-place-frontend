import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4CAF50", "#F44336", "#FFC107"];

// Custom active shape for the hovered slice
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  
  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        style={{ fontWeight: "bold" }}
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={cos >= 0 ? "start" : "end"}
        fill="#333"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

const CustomerReviewsGraph = () => {
  const [feedbackData, setFeedbackData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:10000/graphs/feedback-stats")
      .then((response) => response.json())
      .then((data) => {
        // Convert string counts to numbers
        data.positive_count = Number(data.positive_count);
        data.negative_count = Number(data.negative_count);
        data.neutral_count = Number(data.neutral_count);
        setFeedbackData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading feedback data...</p>;
  if (error) return <p>Error loading data. Please try again later.</p>;
  if (!feedbackData) return <p>No feedback data available.</p>;

  const { positive_count, negative_count, neutral_count } = feedbackData;
  const totalFeedbacks = positive_count + negative_count + neutral_count;

  const chartData = [
    { name: "Positive", value: positive_count },
    { name: "Negative", value: negative_count },
    { name: "Neutral", value: neutral_count },
  ];

  // Generate dynamic report based on feedback distribution
  let reportMessage = "";
  if (positive_count > negative_count && positive_count > neutral_count) {
    reportMessage =
      "Most of the feedback is positive, indicating high customer satisfaction. We should continue to improve and reward loyal customers.";
  } else if (negative_count > positive_count && negative_count > neutral_count) {
    reportMessage =
      "There is a high percentage of negative feedback, suggesting potential issues that need urgent attention. Analyzing customer concerns and addressing them should be a priority.";
  } else if (neutral_count > positive_count && neutral_count > negative_count) {
    reportMessage =
      "A significant portion of the feedback is neutral, meaning customers are not fully engaged. Improvements in customer experience may be necessary to boost satisfaction.";
  } else {
    reportMessage =
      "Feedback is fairly balanced. Continuous monitoring and improvements are essential to maintain customer satisfaction.";
  }

  const onPieEnter = (data, index) => {
    setActiveIndex(index);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Customer Feedback</h2>
      <div style={{ margin: "0 auto", width: 400 }}>
        <ResponsiveContainer width={400} height={300}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            {/* Updated Tooltip: shows the count value instead of NaN% */}
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <h3>Total Feedbacks: {totalFeedbacks}</h3>
      <h4>Report:</h4>
      <p>{reportMessage}</p>
    </div>
  );
};

export default CustomerReviewsGraph;
