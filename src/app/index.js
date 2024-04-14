import React from "react";
import StickyTab from "./components/stickyTab";
import "./index.scss";

const Index = () => {
  return (
    <div className="contentWrap">
      <div className="homeHeader">头部区域区域，滑动时需要保留</div>
      <div className="vertScrollWrap">
        <div className="middleArea">中间区域，滑动时无需保留</div>
        <StickyTab />
      </div>
    </div>
  );
};

export default Index;
