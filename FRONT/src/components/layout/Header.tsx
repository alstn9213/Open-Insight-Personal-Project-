import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  // 공통 메뉴 스타일 정의 (반복 코드 줄이기)
  const navItemStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
      isActive
        ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100" // 활성화 상태
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-500" // 기본 상태
    }`;

  return (
    <div className="navbar bg-base-100 shadow-sm border-b px-4 h-16">
      {/* 1. 좌측: 로고 */}
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-blue-600 hover:bg-transparent">
          Open Insight
        </Link>
      </div>

      {/* 2. 중앙: 메뉴 (상권분석, 창업순위) */}
      <div className="navbar-center hidden lg:flex">
        <nav className="flex gap-2">
          {/* 상권분석 버튼 */}
          <NavLink to="/analysis" className={navItemStyle}>
            {/* 차트 아이콘 (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            상권분석
          </NavLink>

          {/* 창업순위 버튼 */}
          <NavLink to="/ranking" className={navItemStyle}>
            {/* 트로피 아이콘 (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            밀집도 순위
          </NavLink>
        </nav>
      </div>

      {/* 3. 우측: 로그인/회원가입 */}
      <div className="navbar-end flex gap-2">
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            className="btn btn-error text-white btn-sm px-4 rounded-md"
          >
            로그아웃
          </button>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-600">
              로그인
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm text-white px-5 rounded-md shadow-md hover:shadow-lg transition-shadow">
              회원가입
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;