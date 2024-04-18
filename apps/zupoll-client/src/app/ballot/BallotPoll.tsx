import VoteDialog from "@/components/ui/VoteDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FuzzySearch from "fuzzy-search"; // Or: var FuzzySearch = require('fuzzy-search');
import { useMemo, useState } from "react";
import styled from "styled-components";
import { PollWithCounts } from "../../api/requestTypes";

type SearchItem = {
  value: string;
};

export function BallotPoll({
  canVote,
  poll,
  voteIdx,
  finalVoteIdx,
  onVoted,
  submitVotes
}: {
  canVote: boolean;
  poll: PollWithCounts;
  voteIdx: number | undefined;
  finalVoteIdx: number | undefined;
  onVoted: (pollId: string, voteIdx: number) => void;
  submitVotes: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const searcher = useMemo(() => {
    const values = poll.options.map((opt) => ({ value: opt }));
    const searcher = new FuzzySearch<SearchItem>(values, ["value"], {
      caseSensitive: false,
      sort: true
    });
    return searcher;
  }, [poll.options]);

  const matchingOptions = useMemo(() => {
    if (searchTerm === "") {
      return poll.options;
    }

    const result = searcher.search(searchTerm);

    return result.map((r) => r.value);
  }, [poll.options, searchTerm, searcher]);

  const totalVotes = poll.votes.reduce((a, b) => a + b, 0);

  const getVoteDisplay = (a: number, b: number) => {
    if (b === 0) {
      return "0%";
    }
    const percentVal = ((a / b) * 100).toFixed(1);
    return `${percentVal}%`;
  };

  const [showingOptionIdx, setShowingOptionIdx] = useState<number | undefined>(
    undefined
  );

  const isHackathonView = poll.options.length > 6;

  return (
    <>
      {canVote && showingOptionIdx !== undefined && (
        <VoteDialog
          text={poll.options[showingOptionIdx]}
          close={() => setShowingOptionIdx(undefined)}
          onVoted={() => {
            onVoted(poll.id, showingOptionIdx);
            setShowingOptionIdx(undefined);
            submitVotes();
          }}
        />
      )}
      <Card className="pt-6">
        <CardContent>
          <PollHeader>{poll.body}</PollHeader>
          {isHackathonView && (
            <Input
              placeholder="Search Options"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
              type="text"
            />
          )}

          <div className="flex flex-col gap-2">
            {matchingOptions.map((opt, idx) => (
              <div
                className={cn(
                  "relative overflow-hidden bg-background px-4 py-2 rounded-xl flex flex-row border-2 dark:border-",
                  canVote
                    ? "select-none cursor-pointer hover:bg-accent ring-foreground active:ring-offset-2 active:ring-2 active:ring-offset-background"
                    : "",
                  voteIdx === idx
                    ? "bg-green-200 hover:bg-green-300 border-green-500 dark:text-background"
                    : "border-gray-200 dark:border-gray-700"
                )}
                key={idx}
                onClick={() => {
                  if (isHackathonView && canVote) {
                    setShowingOptionIdx(idx);
                  } else if (canVote) {
                    onVoted(poll.id, idx);
                  }
                }}
              >
                <div
                  className={cn(
                    "z-[1] absolute top-0 left-0 h-full",
                    finalVoteIdx === idx ? "bg-green-300" : "bg-green-400"
                  )}
                  style={{
                    width: `${
                      totalVotes === 0 || canVote
                        ? 0
                        : (poll.votes[idx] / totalVotes) * 100
                    }%`
                  }}
                />
                {canVote ? (
                  <PollPreResult></PollPreResult>
                ) : (
                  <PollResult>
                    {getVoteDisplay(poll.votes[idx], totalVotes)}
                  </PollResult>
                )}
                <OptionString>{opt}</OptionString>
              </div>
            ))}
          </div>
          <div className="mt-2">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const PollHeader = styled.div`
  padding: 0px;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PollPreResult = styled.span`
  z-index: 2;
  width: 0.5rem;
  position: relative;
`;

const PollResult = styled.span`
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  display: inline-flex;
  justify-content: flex-end;
  padding-right: 0.5rem;
  align-items: center;
  font-weight: bold;
  width: 3.5rem;
  font-size: 0.9em;
`;

const OptionString = styled.span`
  position: relative;
  z-index: 2;
  padding-left: 1rem;
`;

const TotalVotesContainer = styled.div`
  margin-top: 0.75rem;
  color: #666;
  font-size: 0.9em;
`;