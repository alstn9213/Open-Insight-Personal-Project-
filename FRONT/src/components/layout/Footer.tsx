const Footer = () => {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <div className="grid grid-flow-col gap-4">
        <a className="link link-hover">서비스 소개</a>
        <a className="link link-hover">데이터 출처</a>
        <a className="link link-hover">이용약관</a>
      </div>
      <div>
        <p>Copyright © {new Date().getFullYear()} - Open Insight Personal Project</p>
        <p className="text-xs text-gray-500 mt-1">
          본 서비스는 공공데이터포털 및 서울 열린데이터광장의 데이터를 활용하여 제작되었습니다.
        </p>
      </div>
    </footer>
  );
};

export default Footer;