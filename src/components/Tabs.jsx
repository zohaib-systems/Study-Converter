import React from "react";


const Tabs = ({ tabs, activeTab, onTabChange }) => (
  <div className="tabs flex justify-center gap-2 mb-6 mt-2">
    {tabs.map((tab, idx) => (
      <button
        key={tab}
        className={`tabs__button ${activeTab === idx ? "tabs__button--active" : "tabs__button--inactive"}`}
        onClick={() => onTabChange(idx)}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default Tabs;
