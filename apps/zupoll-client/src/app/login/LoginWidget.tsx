import { Spinner } from "@/components/ui/spinner";
import { LoginCategory, LoginConfig } from "@pcd/zupoll-shared";
import _ from "lodash";
import { useMemo, useState } from "react";
import { LOGIN_GROUPS } from "../../api/loginGroups";
import { LoginState, ZupollError } from "../../types";
import { LoginActionsForLoginGroup } from "./LoginActionsForLoginGroup";
import { SelectLoginGroup } from "./SelectLoginGroup";

/**
 * Lets user select event and then log in as one of the groups in
 * that event.
 */
export function LoginWidget(props: LoginWidgetProps) {
  const [selectedGroupId, setCurGroupCategory] = useState<
    LoginCategory | undefined
  >();
  const selectedGroup = useMemo(() => {
    return LOGIN_GROUPS.find((g) => g.category === selectedGroupId);
  }, [selectedGroupId]);

  if (props.loggingIn) {
    return <LoggingIn />;
  }

  return (
    <>
      <div className="flex flex-row gap-2 justify-between grow">
        <div className="flex-shrink-0 min-w-52 grow">
          {selectedGroup ? (
            <LoginActionsForLoginGroup {...props} group={selectedGroup} />
          ) : (
            <div className="text-center h-full flex items-center justify-end pr-4">
              Choose a group to log in
            </div>
          )}
        </div>

        <div>
          <SelectLoginGroup
            selectedGroup={selectedGroupId}
            setSelectedGroup={setCurGroupCategory}
            groups={LOGIN_GROUPS}
          />
        </div>
      </div>
    </>
  );
}

const tips = [
  "Zupoll lets you vote on ballots anonymously",
  "Your votes are un-linkable across ballots."
];

export function LoggingIn() {
  const randomTip = useMemo(() => {
    return _.sample(tips);
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full min-h-12">
      Logging In
      <Spinner className="w-8 h-8" />
      <div className="text-sm text-foreground/90">Tip: {randomTip}</div>
    </div>
  );
}

/**
 * Props for {@link LoginWidget}.
 */
export interface LoginWidgetProps {
  configs: LoginConfig[];
  onLogin: (loginState: LoginState) => void;
  loggingIn: boolean;
  setError: (error?: ZupollError) => void;
  setServerLoading: (loading: boolean) => void;
  serverLoading: boolean;
}