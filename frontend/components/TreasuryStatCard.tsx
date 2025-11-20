import React from "react";

interface Props {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const TreasuryStatCard: React.FC<Props> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="flex-1 p-5 rounded-xl bg-gray-800 border border-gray-700/70 shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default TreasuryStatCard;
