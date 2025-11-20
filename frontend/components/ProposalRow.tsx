// components/ProposalRow.tsx

"use client";

import React from "react";
import {
  Users,
  Clock,
  GitPullRequest,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export interface Proposal {
  id: number;
  title: string;
  proposer: string;
  status: "Voting" | "Executed" | "Failed";
  endDate: string;
  votesFor: number;
  votesAgainst: number;
}

const ProposalRow: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const statusClass = {
    Voting: "bg-blue-600/30 text-blue-400 border-blue-600",
    Executed: "bg-green-600/30 text-green-400 border-green-600",
    Failed: "bg-red-600/30 text-red-400 border-red-600",
  }[proposal.status];

  const totalVotes = proposal.votesFor + proposal.votesAgainst || 1;
  const forPercent = Math.round((proposal.votesFor / totalVotes) * 100);
  const againstPercent = Math.round((proposal.votesAgainst / totalVotes) * 100);

  return (
    <div className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 mb-3 cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <p className="text-lg font-semibold text-white">{proposal.title}</p>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusClass}`}>
          {proposal.status}
        </span>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-400">
        <div className="flex items-center"><GitPullRequest className="w-4 h-4 mr-1" /> ID: {proposal.id}</div>
        <div className="flex items-center"><Users className="w-4 h-4 mr-1" /> {proposal.proposer}</div>
        <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Ends: {proposal.endDate}</div>
      </div>

      <div className="mt-3 flex items-center space-x-2 text-sm">
        <div className="flex-1 h-2 rounded-full bg-red-500 overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${forPercent}%` }}
          />
        </div>
        <span className="flex items-center text-green-400 font-medium">
          <ThumbsUp className="w-4 h-4 mr-1" /> {forPercent}%
        </span>
        <span className="flex items-center text-red-400 font-medium">
          <ThumbsDown className="w-4 h-4 mr-1" /> {againstPercent}%
        </span>
      </div>
    </div>
  );
};

export default ProposalRow;

