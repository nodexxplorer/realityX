// components/DAOGovernanceDashboard.tsx

"use client";

import React from "react";
import { Users, BarChart2, Vault, Zap } from "lucide-react";
import ProposalRow, { Proposal } from "./ProposalRow";
import TreasuryStatCard from "./TreasuryStatCard";
import VotingWalletList from "./VotingWalletList";

const DAODashboard: React.FC = () => {
  const sampleProposals: Proposal[] = [
    {
      id: 101,
      title: "Fund development of V2 Smart Contract",
      proposer: "0xDAOLead...",
      status: "Voting",
      endDate: "25 Oct 2025",
      votesFor: 85000,
      votesAgainst: 1200,
    },
    {
      id: 100,
      title: "Adjust Treasury Allocation Strategy",
      proposer: "0xCommunity...",
      status: "Executed",
      endDate: "01 Sep 2025",
      votesFor: 125000,
      votesAgainst: 500,
    },
    {
      id: 99,
      title: "Change Voting Period to 72 Hours",
      proposer: "0xDevTeam...",
      status: "Failed",
      endDate: "15 Aug 2025",
      votesFor: 15000,
      votesAgainst: 98000,
    },
  ];

  const treasuryStats = [
    { title: "Total Assets Under Mgmt", value: "$45.2M", icon: Vault, color: "text-green-400" },
    { title: "Total Token Holders", value: "12,450", icon: Users, color: "text-blue-400" },
    { title: "Active Voters (7d)", value: "3,100", icon: Zap, color: "text-purple-400" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-900">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-white">DAO Governance</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Create New Proposal
        </button>
      </header>

      <h2 className="text-xl font-medium mb-4 mt-6 text-white">Treasury Overview</h2>
      <div className="flex space-x-6 mb-8">
        {treasuryStats.map((stat, i) => (
          <TreasuryStatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <h2 className="text-xl font-medium mb-4 text-white">Active & Recent Proposals</h2>
          {sampleProposals.map((p) => (
            <ProposalRow key={p.id} proposal={p} />
          ))}
          <button className="w-full text-center py-2 text-blue-400 border border-blue-600/50 rounded-lg hover:bg-blue-900/50 transition-colors text-sm">
            View All 150 Proposals
          </button>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/70 shadow-lg">
            <h2 className="text-lg font-medium mb-4 text-white">Treasury Allocation</h2>
            <div className="h-40 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center relative">
                <BarChart2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Distribution of Tokens, Stablecoins, and LP Shares.</p>
          </div>

          <VotingWalletList />
        </div>
      </div>
    </div>
  );
};

export default DAODashboard;
