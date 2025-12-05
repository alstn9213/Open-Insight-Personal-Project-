import { Bar } from "react-chartjs-2";
import '../../utils/chartSetup';

interface SalesChartProps {
  averageSales: number;
  storeCount: number;
}

const SalesChart = ({averageSales, storeCount}: SalesChartProps) => {
  const data = {
    labels: ["평균 매출(만원)", "점포 수(개)"],
    datasets: [
      {
        label: "상권 지표",
        data: [averageSales / 10000, storeCount], // 매출은 만원 단위로 변환
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {display: false},
      title: {
        display: true,
        text: "매출 및 규모 분석",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options}/>;
};

export default SalesChart;