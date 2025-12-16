import { Bar } from "react-chartjs-2";
import '../../utils/chartSetup';

interface SalesChartProps {
  averageSales: number;
  storeCount: number;
}

const SalesChart = ({averageSales, storeCount}: SalesChartProps) => {
  const data = {
    labels: ["상권지표"],
    datasets: [
      {
        label: "평균 지표(만원)",
        data: [averageSales / 10000], // 매출은 만원 단위로 변환
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        yAxisID: 'y', // 왼쪽 축 사용
      },
      {
        label: "점포 수(개)",
        data: [storeCount],
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        yAxisID: 'y1', // 오른쪽 축 사용
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,  // 마우스 호버 시 두 막대 모두 툴팁 표시
      intersect: false,
    },
    plugins: {
      legend: { position: 'bottom' as const }, // 범례 표시
      title: { display: true, text: "매출 및 규모 분석" },
    },
    scales: {
      x: {
        type: 'category' as const,
        display: true,
        grid: {
          display: false // 세로 그리드 선은 지저분해 보일 수 있어 끄는 것을 추천
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: '매출 (만원)' },
        beginAtZero: true 
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false }, // 그리드 선 겹침 방지
        title: { display: true, text: '점포 수 (개)' },
        beginAtZero: true
      },
    },
  };

  return <Bar data={data} options={options}/>;
};

export default SalesChart;