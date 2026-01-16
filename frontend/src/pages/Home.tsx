import {  Map, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section: 메인 타이틀 및 CTA */}
      <section className="hero min-h-[100vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              데이터로 찾는 <br />
              <span className="text-blue-600">틈새시장</span>
            </h1>
            <p className="py-6 text-lg text-gray-600 mb-4">
              공공데이터 기반의 <strong>순성장률</strong>과 <strong>매출 분석</strong>을 통해 <br />
              숨겨진 블루오션을 찾아드립니다.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/analysis" className="btn btn-primary btn-lg shadow-lg gap-2">
                <Map size={20} />
                지도로 상권 분석하기
              </Link>
              <Link to="/ranking" className="btn btn-outline btn-primary btn-lg shadow-lg gap-2 bg-white">
                <TrendingUp size={20} />
                밀집도 순위 확인
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;