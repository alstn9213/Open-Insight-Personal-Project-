import { ArrowRight, BarChart3, Map, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section: 메인 타이틀 및 CTA */}
      <section className="hero min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              데이터로 찾는 <br />
              <span className="text-blue-600">성공 창업</span>의 길
            </h1>
            <p className="py-6 text-lg text-gray-600 mb-4">
              "감"에 의존하는 창업은 이제 그만. <br />
              공공데이터 기반의 <strong>순성장률</strong>과 <strong>매출 분석</strong>을 통해 <br />
              숨겨진 블루오션을 찾아드립니다.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/analysis" className="btn btn-primary btn-lg shadow-lg gap-2">
                <Map size={20} />
                상권 지도 분석하기
              </Link>
              <Link to="/ranking" className="btn btn-outline btn-primary btn-lg shadow-lg gap-2 bg-white">
                <TrendingUp size={20} />
                창업 순위 확인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section: 핵심 기능 소개 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Open Insight 핵심 기능</h2>
            <p className="text-gray-500">예비 창업자에게 꼭 필요한 정보만 담았습니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-100 border border-gray-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-blue-100 rounded-full mb-4 text-blue-600">
                  <Map size={32} />
                </div>
                <h3 className="card-title text-xl mb-2">지도 기반 상권 시각화</h3>
                <p className="text-gray-600">
                  서울시 행정동별 상권 등급(신호등)을 지도 위에서 직관적으로 확인하세요.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-100 border border-gray-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-green-100 rounded-full mb-4 text-green-600">
                  <BarChart3 size={32} />
                </div>
                <h3 className="card-title text-xl mb-2">정밀 데이터 분석</h3>
                <p className="text-gray-600">
                  단순 매출뿐만 아니라 폐업률, 유동인구를 종합한 순성장률 지표를 제공합니다.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-100 border border-gray-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-purple-100 rounded-full mb-4 text-purple-600">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="card-title text-xl mb-2">맞춤형 추천 알고리즘</h3>
                <p className="text-gray-600">
                  수익성을 원하시나요, 안전성을 원하시나요? 가중치를 설정해 나만의 랭킹을 찾아보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Section: 신뢰도 강조 (Mock Data 활용) */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-700">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">424+</div>
              <div className="text-gray-400">분석된 서울시 행정동</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">6+</div>
              <div className="text-gray-400">주요 분석 업종</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">Daily</div>
              <div className="text-gray-400">최신 데이터 업데이트</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            지금 바로 시장의 기회를 확인하세요
          </h2>
          <Link to="/analysis" className="btn btn-primary btn-lg shadow-lg">
            무료로 상권 분석 시작하기 <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;