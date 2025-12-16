import { Bar } from "react-chartjs-2";
import '../../utils/chartSetup';

interface GrowthChartProps {
  growthRate: number;
  closingRate: number;
  netGrowthRate: number;
}

const GrowthChart = ({
  growthRate,
  closingRate,
  netGrowthRate,
}: GrowthChartProps) => {
  const data = {
    labels: ["성장률(%)", "폐업률(%)", "순성장률(%)"],
    datasets: [
      {
        label: "비율(%)",
        data: [growthRate, closingRate, netGrowthRate],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // 성장률(녹생)
          "rgba(255, 99, 132, 0.6)", // 폐업룰(빨강)
          netGrowthRate >= 0
            ? "rgba(54, 162, 235, 0.6)"
            : "rgba(255, 159, 64, 0.6)", // 순 성장률(양수: 파랑, 음수: 주황)
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          netGrowthRate >= 0 ? "rgba(54, 162, 235, 1)" : "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {display: false},
      title: {
        display: true,
        text: "성장성 vs 위험도",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options}/>
};

export default GrowthChart;