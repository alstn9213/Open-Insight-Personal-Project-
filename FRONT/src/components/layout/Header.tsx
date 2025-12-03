import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-blue-600">
          Open Insight
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 font-medium">
          <li><Link to="/analysis">상권분석</Link></li>
          <li><Link to="/ranking">창업순위</Link></li>
          <li><Link to="/guide">창업가이드</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Header;