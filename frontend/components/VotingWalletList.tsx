// components/votingwalletlist.tsx

import React from "react";

const VotingWalletList = () => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/70 shadow-lg">
    <h2 className="text-lg font-medium mb-4">Top Voting Wallets</h2>
    <ul className="space-y-3 text-sm">
      <li className="flex justify-between items-center">
        <span className="text-gray-300">0xBigWhale...789</span>
        <span className="font-semibold text-purple-400">1.2M Tokens</span>
      </li>
      <li className="flex justify-between items-center">
        <span className="text-gray-300">0xFoundation...ABC</span>
        <span className="font-semibold text-purple-400">850K Tokens</span>
      </li>
      <li className="flex justify-between items-center">
        <span className="text-gray-300">0xCustodian...DEF</span>
        <span className="font-semibold text-purple-400">420K Tokens</span>
      </li>
    </ul>
    <button className="mt-4 w-full text-center py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-gray-400">
      View All Holders
    </button>
  </div>
);

export default VotingWalletList;

